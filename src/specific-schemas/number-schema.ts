import { ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Defs, TypeSchema } from '../schema';

export default class NumberSchema<T extends number, L extends string> extends TypeSchema<T, L> {
    #enum?: T[];

    #integer = false;

    #minimum?: number;

    #maximum?: number;

    constructor(values: T[] = []) {
        super();
        if (values.length) {
            this.#enum = values;
        }
    }

    validate(value: unknown, lang: L, errorKeeper: ErrorKeeper<L>): value is T {
        if (typeof value !== 'number') {
            errorKeeper.push(errorKeeper.formatters(lang).number.type());
            return false;
        }
        if (this.#enum && !this.#enum.includes(value as T)) {
            errorKeeper.push(errorKeeper.formatters(lang).number.enum(this.#enum));
            return false;
        }
        if (this.#minimum !== undefined && value < this.#minimum) {
            errorKeeper.push(errorKeeper.formatters(lang).number.minimum(this.#minimum));
            return false;
        }
        if (this.#maximum !== undefined && value > this.#maximum) {
            errorKeeper.push(errorKeeper.formatters(lang).number.maximum(this.#maximum));
            return false;
        }
        if (this.#integer) {
            if (value % 1 !== 0) {
                errorKeeper.push(errorKeeper.formatters(lang).number.integer());
                return false;
            }
        }

        return true;
    }

    makeJSONSchema(pointer: Pointer, defs: Defs<L>, lang: L): JSONSchemaValue {
        return {
            type: this.#integer ? 'integer' : 'number',
            title: this.getTitle(lang),
            description: this.getDescription(lang),
            minimum: this.#minimum,
            maximum: this.#maximum,
            enum: this.#enum,
            defaut: this.getDefault(),
        };
    }

    enum(values: T[]): this {
        this.#enum = values;
        return this;
    }

    minimum(value: number): this {
        this.#minimum = value;
        return this;
    }

    maximum(value: number): this {
        this.#maximum = value;
        return this;
    }

    integer(integer: boolean = true): this {
        this.#integer = integer;
        return this;
    }
}
