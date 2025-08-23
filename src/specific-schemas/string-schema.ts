import { ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Defs, TypeSchema } from '../schema';

export default class StringSchema<T extends string, L extends string> extends TypeSchema<T, L> {
    #enum?: T[];

    #minLength?: number;

    #maxLength?: number;

    #regexp?: RegExp;

    constructor(values: T[] = []) {
        super();
        if (values.length) {
            this.#enum = values;
        }
    }

    validate(value: unknown, lang: L, errorKeeper: ErrorKeeper<L>): value is T {
        if (typeof value !== 'string') {
            errorKeeper.push(errorKeeper.formatters(lang).string.type());
            return false;
        }
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
