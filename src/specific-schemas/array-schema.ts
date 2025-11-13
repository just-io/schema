import { ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { TypeSchema, Schema, Defs, StringStructure, Result, withDefault } from '../schema';

export default class ArraySchema<T, L extends string> extends TypeSchema<T[], L> {
    #itemSchema: Schema<T, L>;

    #maxItems?: number;

    #minItems?: number;

    #unique?: boolean;

    #validate(values: T[], errorKeeper: ErrorKeeper<L>, length: number): boolean {
        if (this.#maxItems !== undefined && length > this.#maxItems) {
            errorKeeper.push(errorKeeper.formatter.array.maxItems(this.#maxItems));
            return false;
        }
        if (this.#minItems !== undefined && length < this.#minItems) {
            errorKeeper.push(errorKeeper.formatter.array.minItems(this.#minItems));
            return false;
        }
        if (this.#unique && length !== new Set(values).size) {
            errorKeeper.push(errorKeeper.formatter.array.unique());
            return false;
        }
        if (values.length !== length) {
            return false;
        }

        return true;
    }

    constructor(itemSchema: Schema<T, L>) {
        super();
        this.#itemSchema = itemSchema;
    }

    @withDefault
    validate(
        value: unknown,
        errorKeeper: ErrorKeeper<L>,
        useDefault: boolean,
    ): Result<T[], unknown> {
        if (!Array.isArray(value)) {
            errorKeeper.push(errorKeeper.formatter.array.type());
            return { ok: false, error: true };
        }
        const itemValues = value
            .map((item, i) => this.#itemSchema.validate(item, errorKeeper.child(i), useDefault))
            .filter((result) => result.ok)
            .map((result) => result.value);

        if (!this.#validate(itemValues, errorKeeper, value.length)) {
            return { ok: false, error: true };
        }

        return { ok: true, value: itemValues };
    }

    @withDefault
    cast(
        value: StringStructure,
        errorKeeper: ErrorKeeper<L>,
        useDefault: boolean,
    ): Result<T[], unknown> {
        if (value === undefined || value instanceof File) {
            errorKeeper.push(errorKeeper.formatter.array.type());
            return { ok: false, error: true };
        }
        const array = Array.isArray(value)
            ? value
            : Array.from(
                  Object.entries(value).reduce((arr, [i, v]) => {
                      arr[i as unknown as number] = v;
                      return arr;
                  }, [] as StringStructure[]),
              );

        const itemValues = array
            .map((item, i) => this.#itemSchema.cast(item, errorKeeper.child(i), useDefault))
            .filter((result) => result.ok)
            .map((result) => result.value);

        if (!this.#validate(itemValues, errorKeeper, array.length)) {
            return { ok: false, error: true };
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
            minItems: this.#maxItems,
            maxItems: this.#minItems,
            uniqueItems: this.#unique,
            defaut: this.getDefault(),
        };
    }
}
