import { ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Defs, Result, StringStructure, TypeSchema, withDefault } from '../schema';

export default class ValueSchema<
    T extends string | number | boolean | null,
    L extends string,
> extends TypeSchema<T, L> {
    #expectedValue: T;

    constructor(expectedValue: T) {
        super();
        this.#expectedValue = expectedValue;
    }

    @withDefault
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    validate(
        value: unknown,
        lang: L,
        errorKeeper: ErrorKeeper<L>,
        useDefault: boolean,
    ): Result<T, unknown> {
        if (value !== this.#expectedValue) {
            errorKeeper.push(errorKeeper.formatters(lang).value(this.#expectedValue));
            return { ok: false, error: true };
        }

        return { ok: true, value: value as T };
    }

    makeJSONSchema(pointer: Pointer, defs: Defs<L>, lang: L): JSONSchemaValue {
        if (typeof this.#expectedValue === 'string') {
            return {
                type: 'string',
                title: this.getTitle(lang),
                description: this.getDescription(lang),
                const: this.#expectedValue,
                defaut: this.getDefault() as string | undefined,
            };
        }
        if (typeof this.#expectedValue === 'number') {
            return {
                type: 'number',
                title: this.getTitle(lang),
                description: this.getDescription(lang),
                const: this.#expectedValue,
                defaut: this.getDefault() as number | undefined,
            };
        }
        if (typeof this.#expectedValue === 'boolean') {
            return {
                type: 'boolean',
                title: this.getTitle(lang),
                description: this.getDescription(lang),
                const: this.#expectedValue,
                defaut: this.getDefault() as boolean | undefined,
            };
        }
        if (this.#expectedValue === null) {
            return {
                type: 'null',
                title: this.getTitle(lang),
                description: this.getDescription(lang),
                const: this.#expectedValue,
                defaut: this.getDefault() as null | undefined,
            };
        }
        return {
            title: this.getTitle(lang),
            description: this.getDescription(lang),
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
        if (typeof this.#expectedValue === 'string') {
            if (value === this.#expectedValue) {
                return { ok: true, value: this.#expectedValue };
            }
            errorKeeper.push(errorKeeper.formatters(lang).value(this.#expectedValue));
            return { ok: false, error: true };
        }
        if (typeof this.#expectedValue === 'number') {
            if (value !== '' && Number(value) === this.#expectedValue) {
                return { ok: true, value: this.#expectedValue };
            }
            errorKeeper.push(errorKeeper.formatters(lang).value(this.#expectedValue));
            return { ok: false, error: true };
        }
        if (typeof this.#expectedValue === 'boolean') {
            if (this.#expectedValue) {
                if (value !== '') {
                    return { ok: true, value: this.#expectedValue };
                }
                errorKeeper.push(errorKeeper.formatters(lang).string.minLength(1));
                return { ok: false, error: true };
            } else {
                if (value === '') {
                    return { ok: true, value: this.#expectedValue };
                }
                errorKeeper.push(errorKeeper.formatters(lang).string.maxLength(0));
                return { ok: false, error: true };
            }
        }
        if (this.#expectedValue === null) {
            if (value === '') {
                return { ok: true, value: this.#expectedValue };
            }
            errorKeeper.push(errorKeeper.formatters(lang).string.maxLength(0));
            return { ok: false, error: true };
        }
        errorKeeper.push(errorKeeper.formatters(lang).string.type());
        return { ok: false, error: true };
    }
}
