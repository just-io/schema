import { ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Defs, Result, StringStructure, TypeSchema, withDefault } from '../schema';

export default class NumberSchema<T extends number, L extends string> extends TypeSchema<T, L> {
    #enum?: T[];

    #integer = false;

    #minimum?: number;

    #maximum?: number;

    #validate(value: number, errorKeeper: ErrorKeeper<L>): boolean {
        if (this.#enum && !this.#enum.includes(value as T)) {
            errorKeeper.push(errorKeeper.formatter.number.enum(this.#enum));
            return false;
        }
        if (this.#minimum !== undefined && value < this.#minimum) {
            errorKeeper.push(errorKeeper.formatter.number.minimum(this.#minimum));
            return false;
        }
        if (this.#maximum !== undefined && value > this.#maximum) {
            errorKeeper.push(errorKeeper.formatter.number.maximum(this.#maximum));
            return false;
        }
        if (this.#integer) {
            if (value % 1 !== 0) {
                errorKeeper.push(errorKeeper.formatter.number.integer());
                return false;
            }
        }

        return true;
    }

    constructor(values: T[] = []) {
        super();
        if (values.length) {
            this.#enum = values;
        }
    }

    @withDefault
    validate(
        value: unknown,
        errorKeeper: ErrorKeeper<L>,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        useDefault: boolean,
    ): Result<T, unknown> {
        if (typeof value !== 'number') {
            errorKeeper.push(errorKeeper.formatter.number.type());
            return { ok: false, error: true };
        }

        if (!this.#validate(value, errorKeeper)) {
            return { ok: false, error: true };
        }

        return { ok: true, value: value as T };
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

    @withDefault
    cast(
        value: StringStructure,
        errorKeeper: ErrorKeeper<L>,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        useDefault: boolean,
    ): Result<T, unknown> {
        if (typeof value !== 'string' || value === '') {
            errorKeeper.push(errorKeeper.formatter.number.type());
            return { ok: false, error: true };
        }

        const castedValue = Number(value);
        if (Number.isNaN(castedValue)) {
            errorKeeper.push(errorKeeper.formatter.number.type());
            return { ok: false, error: true };
        }
        if (!this.#validate(castedValue, errorKeeper)) {
            return { ok: false, error: true };
        }

        return { ok: true, value: castedValue as T };
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
