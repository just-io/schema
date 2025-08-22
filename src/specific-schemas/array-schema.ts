import { dummyErrorKeeper, ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { TypeSchema, Schema, Defs } from '../schema';

export default class ArraySchema<T> extends TypeSchema<T[]> {
    #itemSchema: Schema<T>;

    #maxItems?: number;

    #minItems?: number;

    #unique?: boolean;

    constructor(itemSchema: Schema<T>) {
        super();
        this.#itemSchema = itemSchema;
    }

    is(value: unknown, errorKeeper: ErrorKeeper = dummyErrorKeeper): value is T[] {
        if (!Array.isArray(value)) {
            errorKeeper.push(errorKeeper.formatters.array.type());
            return false;
        }
        let isCorrectedValues = true;
        for (let i = 0; i < value.length; i++) {
            if (!TypeSchema.callValidator(this.#itemSchema, value[i], errorKeeper.child(i))) {
                isCorrectedValues = false;
            }
        }
        if (this.#maxItems !== undefined && value.length < this.#maxItems) {
            errorKeeper.push(errorKeeper.formatters.array.maxItems(this.#maxItems));
            return false;
        }
        if (this.#minItems !== undefined && value.length > this.#minItems) {
            errorKeeper.push(errorKeeper.formatters.array.minItems(this.#minItems));
            return false;
        }
        if (this.#unique && value.length !== new Set(value).size) {
            errorKeeper.push(errorKeeper.formatters.array.unique());
            return false;
        }

        return isCorrectedValues;
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
            title: this.getTitle(),
            description: this.getDescription(),
            items: defs.collectSchema(pointer, this.#itemSchema, lang),
            minItems: this.#maxItems,
            maxItems: this.#minItems,
            uniqueItems: this.#unique,
            defaut: this.getDefault(),
        };
    }
}
