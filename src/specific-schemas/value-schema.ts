import { ErrorFormatter } from '../error-formatter';
import { ErrorKeeper, ValidationError } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Defs, StringStructure, TypeSchema, withDefault } from '../schema';
import { Result } from '../result';
import { ErrorSet } from '../error-set';

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
    validate(
        value: unknown,
        errorKeeper: ErrorKeeper,
        formatter: ErrorFormatter,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        useDefault: boolean,
    ): Result<T, ErrorSet<ValidationError>> {
        if (value !== this.#expectedValue) {
            errorKeeper.push({ detail: formatter.value(this.#expectedValue) });
            return { ok: false, error: errorKeeper.makeErrorSet() };
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
        errorKeeper: ErrorKeeper,
        formatter: ErrorFormatter,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        useDefault: boolean,
    ): Result<T, ErrorSet<ValidationError>> {
        if (typeof value !== 'string') {
            errorKeeper.push({ detail: formatter.string.type() });
            return { ok: false, error: errorKeeper.makeErrorSet() };
        }
        if (typeof this.#expectedValue === 'string') {
            if (value === this.#expectedValue) {
                return { ok: true, value: this.#expectedValue };
            }
            errorKeeper.push({ detail: formatter.value(this.#expectedValue) });
            return { ok: false, error: errorKeeper.makeErrorSet() };
        }
        if (typeof this.#expectedValue === 'number') {
            if (value !== '' && Number(value) === this.#expectedValue) {
                return { ok: true, value: this.#expectedValue };
            }
            errorKeeper.push({ detail: formatter.value(this.#expectedValue) });
            return { ok: false, error: errorKeeper.makeErrorSet() };
        }
        if (typeof this.#expectedValue === 'boolean') {
            if (this.#expectedValue) {
                if (value !== '') {
                    return { ok: true, value: this.#expectedValue };
                }
                errorKeeper.push({ detail: formatter.string.minLength(1) });
                return { ok: false, error: errorKeeper.makeErrorSet() };
            } else {
                if (value === '') {
                    return { ok: true, value: this.#expectedValue };
                }
                errorKeeper.push({ detail: formatter.string.maxLength(0) });
                return { ok: false, error: errorKeeper.makeErrorSet() };
            }
        }
        if (this.#expectedValue === null) {
            if (value === '') {
                return { ok: true, value: this.#expectedValue };
            }
            errorKeeper.push({ detail: formatter.string.maxLength(0) });
            return { ok: false, error: errorKeeper.makeErrorSet() };
        }
        errorKeeper.push({ detail: formatter.string.type() });
        return { ok: false, error: errorKeeper.makeErrorSet() };
    }
}
