import { ErrorFormatter } from '../error-formatter';
import { ErrorKeeper, ValidationError } from '../error-keeper';
import { ErrorSet } from '../error-set';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Result } from '../result';
import { TypeSchema, Schema, Defs, StringStructure, withDefault } from '../schema';

export default class ArraySchema<T, L extends string> extends TypeSchema<T[], L> {
    #itemSchema: Schema<T, L>;

    #maxItems?: number;

    #minItems?: number;

    #unique?: boolean;

    #validate(
        values: T[],
        errorKeeper: ErrorKeeper,
        formatter: ErrorFormatter,
        length: number,
    ): void {
        if (this.#maxItems !== undefined && length > this.#maxItems) {
            errorKeeper.push({ detail: formatter.array.maxItems(this.#maxItems) });
        }
        if (this.#minItems !== undefined && length < this.#minItems) {
            errorKeeper.push({ detail: formatter.array.minItems(this.#minItems) });
        }
        if (this.#unique && length !== new Set(values).size) {
            errorKeeper.push({ detail: formatter.array.unique() });
        }
    }

    constructor(itemSchema: Schema<T, L>) {
        super();
        this.#itemSchema = itemSchema;
    }

    @withDefault
    validate(
        value: unknown,
        errorKeeper: ErrorKeeper,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<T[], ErrorSet<ValidationError>> {
        if (!Array.isArray(value)) {
            errorKeeper.push({ detail: formatter.array.type() });
            return { ok: false, error: errorKeeper.makeErrorSet() };
        }

        const itemValues: T[] = [];
        for (let i = 0; i < value.length; i++) {
            const result = this.#itemSchema.validate(
                value[i],
                errorKeeper.child(i),
                formatter,
                useDefault,
            );
            if (result.ok) {
                itemValues.push(result.value);
            } else {
                errorKeeper.append(result.error);
            }
        }
        if (errorKeeper.hasErrors()) {
            return { ok: false, error: errorKeeper.makeErrorSet() };
        }
        this.#validate(itemValues, errorKeeper, formatter, value.length);
        if (errorKeeper.hasErrors()) {
            return { ok: false, error: errorKeeper.makeErrorSet() };
        }
        return { ok: true, value: itemValues };
    }

    @withDefault
    cast(
        value: StringStructure,
        errorKeeper: ErrorKeeper,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<T[], ErrorSet<ValidationError>> {
        if (value === undefined || value instanceof File) {
            errorKeeper.push({ detail: formatter.array.type() });
            return { ok: false, error: errorKeeper.makeErrorSet() };
        }
        const array = Array.isArray(value)
            ? value
            : Array.from(
                  Object.entries(value).reduce((arr, [i, v]) => {
                      arr[i as unknown as number] = v;
                      return arr;
                  }, [] as StringStructure[]),
              );

        const itemValues: T[] = [];
        for (let i = 0; i < array.length; i++) {
            const result = this.#itemSchema.cast(
                array[i],
                errorKeeper.child(i),
                formatter,
                useDefault,
            );
            if (result.ok) {
                itemValues.push(result.value);
            } else {
                errorKeeper.append(result.error);
            }
        }
        if (errorKeeper.hasErrors()) {
            return { ok: false, error: errorKeeper.makeErrorSet() };
        }
        this.#validate(itemValues, errorKeeper, formatter, array.length);
        if (errorKeeper.hasErrors()) {
            return { ok: false, error: errorKeeper.makeErrorSet() };
        }
        return { ok: true, value: itemValues };
    }

    maxItems(value: number): this {
        this.#maxItems = value;
        return this;
    }

    minItems(value: number): this {
        this.#minItems = value;
        return this;
    }

    unique(unique: boolean = true): this {
        this.#unique = unique;
        return this;
    }

    makeJSONSchema(pointer: Pointer, defs: Defs<L>, lang: L): JSONSchemaValue {
        return {
            type: 'array',
            title: this.getTitle(lang),
            description: this.getDescription(lang),
            items: this.#itemSchema.makeJSONSchema(pointer.concat('item'), defs, lang),
            minItems: this.#minItems,
            maxItems: this.#maxItems,
            uniqueItems: this.#unique,
            defaut: this.getDefault(),
        };
    }
}
