import { ErrorFormatter } from '../error-formatter';
import { ErrorSet } from '../error-set';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Result } from '../result';
import { TypeSchema, Schema, Defs, StringStructure, withDefault, ValidationError } from '../schema';

export default class ArraySchema<T> extends TypeSchema<T[]> {
    #itemSchema: Schema<T>;

    #maxItems?: number;

    #minItems?: number;

    #unique?: boolean;

    #validate(
        values: T[],
        pointer: Pointer,
        formatter: ErrorFormatter,
        length: number,
    ): ErrorSet<ValidationError> {
        const errorSet = new ErrorSet<ValidationError>();
        if (this.#maxItems !== undefined && length > this.#maxItems) {
            errorSet.add({ pointer, detail: formatter.array.maxItems(this.#maxItems) });
        }
        if (this.#minItems !== undefined && length < this.#minItems) {
            errorSet.add({ pointer, detail: formatter.array.minItems(this.#minItems) });
        }
        if (this.#unique && length !== new Set(values).size) {
            errorSet.add({ pointer, detail: formatter.array.unique() });
        }

        return errorSet;
    }

    constructor(itemSchema: Schema<T>) {
        super();
        this.#itemSchema = itemSchema;
    }

    @withDefault
    validate(
        value: unknown,
        pointer: Pointer,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<T[], ErrorSet<ValidationError>> {
        if (!Array.isArray(value)) {
            return {
                ok: false,
                error: new ErrorSet<ValidationError>().add({
                    pointer,
                    detail: formatter.array.type(),
                }),
            };
        }

        const itemValues: T[] = [];
        const errorSet = new ErrorSet<ValidationError>();
        for (let i = 0; i < value.length; i++) {
            const result = this.#itemSchema.validate(
                value[i],
                pointer.concat(i),
                formatter,
                useDefault,
            );
            if (result.ok) {
                itemValues.push(result.value);
            } else {
                errorSet.append(result.error);
            }
        }
        if (errorSet.hasErrors()) {
            return { ok: false, error: errorSet };
        }
        errorSet.append(this.#validate(itemValues, pointer, formatter, value.length));
        if (errorSet.hasErrors()) {
            return { ok: false, error: errorSet };
        }
        return { ok: true, value: itemValues };
    }

    @withDefault
    cast(
        value: StringStructure,
        pointer: Pointer,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<T[], ErrorSet<ValidationError>> {
        if (value === undefined || value instanceof File) {
            return {
                ok: false,
                error: new ErrorSet<ValidationError>().add({
                    pointer,
                    detail: formatter.array.type(),
                }),
            };
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
        const errorSet = new ErrorSet<ValidationError>();
        for (let i = 0; i < array.length; i++) {
            const result = this.#itemSchema.cast(
                array[i],
                pointer.concat(i),
                formatter,
                useDefault,
            );
            if (result.ok) {
                itemValues.push(result.value);
            } else {
                errorSet.append(result.error);
            }
        }
        if (errorSet.hasErrors()) {
            return { ok: false, error: errorSet };
        }
        errorSet.append(this.#validate(itemValues, pointer, formatter, array.length));
        if (errorSet.hasErrors()) {
            return { ok: false, error: errorSet };
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

    makeJSONSchema(pointer: Pointer, defs: Defs, lang: string): JSONSchemaValue {
        return {
            type: 'array',
            title: this.getTitle(lang),
            description: this.getDescription(lang),
            items: this.#itemSchema.makeJSONSchema(pointer.concat('item'), defs, lang),
            minItems: this.#minItems,
            maxItems: this.#maxItems,
            uniqueItems: this.#unique,
            default: this.getDefault(),
        };
    }
}
