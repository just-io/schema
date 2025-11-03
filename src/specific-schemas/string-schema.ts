import { ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Defs, Result, StringStructure, TypeSchema, withDefault } from '../schema';

export default class StringSchema<T extends string, L extends string> extends TypeSchema<T, L> {
    #enum?: T[];

    #minLength?: number;

    #maxLength?: number;

    #regexp?: RegExp;

    #validate(value: string, lang: L, errorKeeper: ErrorKeeper<L>): boolean {
        if (this.#enum && !this.#enum.includes(value as T)) {
            errorKeeper.push(errorKeeper.formatters(lang).string.enum(this.#enum));
            return false;
        }
        if (this.#regexp && !this.#regexp.test(value)) {
            errorKeeper.push(errorKeeper.formatters(lang).string.regexp(this.#regexp));
            return false;
        }
        if (this.#minLength !== undefined && value.length < this.#minLength) {
            errorKeeper.push(errorKeeper.formatters(lang).string.minLength(this.#minLength));
            return false;
        }
        if (this.#maxLength !== undefined && value.length > this.#maxLength) {
            errorKeeper.push(errorKeeper.formatters(lang).string.maxLength(this.#maxLength));
            return false;
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
        lang: L,
        errorKeeper: ErrorKeeper<L>,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        useDefault: boolean,
    ): Result<T, unknown> {
        if (typeof value !== 'string') {
            errorKeeper.push(errorKeeper.formatters(lang).string.type());
            return { ok: false, error: true };
        }
        if (!this.#validate(value, lang, errorKeeper)) {
            return { ok: false, error: true };
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
        lang: L,
        errorKeeper: ErrorKeeper<L>,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        useDefault: boolean,
    ): Result<T, unknown> {
        if (typeof value !== 'string') {
            errorKeeper.push(errorKeeper.formatters(lang).string.type());
            return { ok: false, error: true };
        }
        if (!this.#validate(value, lang, errorKeeper)) {
            return { ok: false, error: true };
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
