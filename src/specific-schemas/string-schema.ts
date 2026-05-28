import { ErrorFormatter } from '../error-formatter';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Defs, StringStructure, TypeSchema, ValidationError, withDefault } from '../schema';
import { Result } from '../result';
import { ErrorSet } from '../error-set';

export default class StringSchema<T extends string> extends TypeSchema<T> {
    #enum?: T[];

    #minLength?: number;

    #maxLength?: number;

    #regexp?: RegExp;

    #validate(
        value: string,
        pointer: Pointer,
        formatter: ErrorFormatter,
    ): ErrorSet<ValidationError> {
        const errorSet = new ErrorSet<ValidationError>();
        if (this.#enum && !this.#enum.includes(value as T)) {
            errorSet.add({ pointer, detail: formatter.string.enum(this.#enum) });
        }
        if (this.#regexp && !this.#regexp.test(value)) {
            errorSet.add({ pointer, detail: formatter.string.regexp(this.#regexp) });
        }
        if (this.#minLength !== undefined && value.length < this.#minLength) {
            errorSet.add({ pointer, detail: formatter.string.minLength(this.#minLength) });
        }
        if (this.#maxLength !== undefined && value.length > this.#maxLength) {
            errorSet.add({ pointer, detail: formatter.string.maxLength(this.#maxLength) });
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
        if (typeof value !== 'string') {
            return {
                ok: false,
                error: new ErrorSet<ValidationError>().add({
                    pointer,
                    detail: formatter.string.type(),
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
            type: 'string',
            title: this.getTitle(lang),
            description: this.getDescription(lang),
            maxLength: this.#maxLength,
            minLength: this.#minLength,
            enum: this.#enum,
            pattern: this.#regexp?.source,
            default: this.getDefault(),
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
        if (typeof value !== 'string') {
            return {
                ok: false,
                error: new ErrorSet<ValidationError>().add({
                    pointer,
                    detail: formatter.string.type(),
                }),
            };
        }
        const errorSet = this.#validate(value, pointer, formatter);
        if (errorSet.hasErrors()) {
            return { ok: false, error: errorSet };
        }

        return { ok: true, value: value as T };
    }

    enum(values: T[]): this {
        this.#enum = values;
        return this;
    }

    minLength(value: number): this {
        this.#minLength = value;
        return this;
    }

    maxLength(value: number): this {
        this.#maxLength = value;
        return this;
    }

    regexp(regexp: RegExp): this {
        this.#regexp = regexp;
        return this;
    }
}
