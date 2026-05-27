import { ErrorFormatter } from '../error-formatter';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Defs, StringStructure, TypeSchema, ValidationError, withDefault } from '../schema';
import { Result } from '../result';
import { ErrorSet } from '../error-set';

export default class NumberSchema<T extends number> extends TypeSchema<T> {
    #enum?: T[];

    #integer = false;

    #minimum?: number;

    #maximum?: number;

    #validate(
        value: number,
        pointer: Pointer,
        formatter: ErrorFormatter,
    ): ErrorSet<ValidationError> {
        const errorSet = new ErrorSet<ValidationError>();
        if (this.#enum && !this.#enum.includes(value as T)) {
            errorSet.add({ pointer, detail: formatter.number.enum(this.#enum) });
        }
        if (this.#minimum !== undefined && value < this.#minimum) {
            errorSet.add({ pointer, detail: formatter.number.minimum(this.#minimum) });
        }
        if (this.#maximum !== undefined && value > this.#maximum) {
            errorSet.add({ pointer, detail: formatter.number.maximum(this.#maximum) });
        }
        if (this.#integer && !Number.isInteger(value)) {
            errorSet.add({ pointer, detail: formatter.number.integer() });
        }

        return errorSet;
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
        pointer: Pointer,
        formatter: ErrorFormatter,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        useDefault: boolean,
    ): Result<T, ErrorSet<ValidationError>> {
        if (typeof value !== 'number') {
            return {
                ok: false,
                error: new ErrorSet<ValidationError>().add({
                    pointer,
                    detail: formatter.number.type(),
                }),
            };
        }

        const errorSet = this.#validate(value, pointer, formatter);
        if (errorSet.hasErrors()) {
            return { ok: false, error: errorSet };
        }

        return { ok: true, value: value as T };
    }

    makeJSONSchema(pointer: Pointer, defs: Defs, lang: string): JSONSchemaValue {
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
        pointer: Pointer,
        formatter: ErrorFormatter,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        useDefault: boolean,
    ): Result<T, ErrorSet<ValidationError>> {
        if (typeof value !== 'string' || value === '') {
            return {
                ok: false,
                error: new ErrorSet<ValidationError>().add({
                    pointer,
                    detail: formatter.number.type(),
                }),
            };
        }

        const castedValue = Number(value);
        if (Number.isNaN(castedValue)) {
            return {
                ok: false,
                error: new ErrorSet<ValidationError>().add({
                    pointer,
                    detail: formatter.number.type(),
                }),
            };
        }
        const errorSet = this.#validate(castedValue, pointer, formatter);
        if (errorSet.hasErrors()) {
            return { ok: false, error: errorSet };
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
