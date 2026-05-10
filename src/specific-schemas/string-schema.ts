import { ErrorFormatter } from '../error-formatter';
import { ErrorKeeper, ValidationError } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Defs, StringStructure, TypeSchema, withDefault } from '../schema';
import { Result } from '../result';
import { ErrorSet } from '../error-set';

export default class StringSchema<T extends string, L extends string> extends TypeSchema<T, L> {
    #enum?: T[];

    #minLength?: number;

    #maxLength?: number;

    #regexp?: RegExp;

    #validate(value: string, errorKeeper: ErrorKeeper, formatter: ErrorFormatter): void {
        if (this.#enum && !this.#enum.includes(value as T)) {
            errorKeeper.push({ detail: formatter.string.enum(this.#enum) });
        }
        if (this.#regexp && !this.#regexp.test(value)) {
            errorKeeper.push({ detail: formatter.string.regexp(this.#regexp) });
        }
        if (this.#minLength !== undefined && value.length < this.#minLength) {
            errorKeeper.push({ detail: formatter.string.minLength(this.#minLength) });
        }
        if (this.#maxLength !== undefined && value.length > this.#maxLength) {
            errorKeeper.push({ detail: formatter.string.maxLength(this.#maxLength) });
        }
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
        errorKeeper: ErrorKeeper,
        formatter: ErrorFormatter,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        useDefault: boolean,
    ): Result<T, ErrorSet<ValidationError>> {
        if (typeof value !== 'string') {
            errorKeeper.push({ detail: formatter.string.type() });
            return { ok: false, error: errorKeeper.makeErrorSet() };
        }
        this.#validate(value, errorKeeper, formatter);
        if (errorKeeper.hasErrors()) {
            return { ok: false, error: errorKeeper.makeErrorSet() };
        }

        return { ok: true, value: value as T };
    }

    makeJSONSchema(pointer: Pointer, defs: Defs<L>, lang: L): JSONSchemaValue {
        return {
            type: 'string',
            title: this.getTitle(lang),
            description: this.getDescription(lang),
            maxLength: this.#maxLength,
            minLength: this.#minLength,
            enum: this.#enum,
            pattern: this.#regexp?.source,
            defaut: this.getDefault(),
        };
    }

    @withDefault
    cast(
        value: StringStructure,
        errorKeeper: ErrorKeeper,
        formatter: ErrorFormatter,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        useDefault: boolean,
    ): Result<T, ErrorSet<ValidationError>> {
        if (typeof value !== 'string') {
            errorKeeper.push({ detail: formatter.string.type() });
            return { ok: false, error: errorKeeper.makeErrorSet() };
        }
        this.#validate(value, errorKeeper, formatter);
        if (errorKeeper.hasErrors()) {
            return { ok: false, error: errorKeeper.makeErrorSet() };
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
