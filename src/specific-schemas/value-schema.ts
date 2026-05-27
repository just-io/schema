import { ErrorFormatter } from '../error-formatter';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Defs, StringStructure, TypeSchema, ValidationError, withDefault } from '../schema';
import { Result } from '../result';
import { ErrorSet } from '../error-set';

export default class ValueSchema<T extends string | number | boolean | null> extends TypeSchema<T> {
    #expectedValue: T;

    constructor(expectedValue: T) {
        super();
        this.#expectedValue = expectedValue;
    }

    @withDefault
    validate(
        value: unknown,
        pointer: Pointer,
        formatter: ErrorFormatter,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        useDefault: boolean,
    ): Result<T, ErrorSet<ValidationError>> {
        if (value !== this.#expectedValue) {
            return {
                ok: false,
                error: new ErrorSet<ValidationError>().add({
                    pointer,
                    detail: formatter.value(this.#expectedValue),
                }),
            };
        }

        return { ok: true, value: value as T };
    }

    makeJSONSchema(pointer: Pointer, defs: Defs, lang: string): JSONSchemaValue {
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
        if (typeof this.#expectedValue === 'string') {
            if (value === this.#expectedValue) {
                return { ok: true, value: this.#expectedValue };
            }
            return {
                ok: false,
                error: new ErrorSet<ValidationError>().add({
                    pointer,
                    detail: formatter.value(this.#expectedValue),
                }),
            };
        }
        if (typeof this.#expectedValue === 'number') {
            if (value !== '' && Number(value) === this.#expectedValue) {
                return { ok: true, value: this.#expectedValue };
            }
            return {
                ok: false,
                error: new ErrorSet<ValidationError>().add({
                    pointer,
                    detail: formatter.value(this.#expectedValue),
                }),
            };
        }
        if (typeof this.#expectedValue === 'boolean') {
            if (this.#expectedValue) {
                if (value !== '') {
                    return { ok: true, value: this.#expectedValue };
                }
                return {
                    ok: false,
                    error: new ErrorSet<ValidationError>().add({
                        pointer,
                        detail: formatter.string.minLength(1),
                    }),
                };
            } else {
                if (value === '') {
                    return { ok: true, value: this.#expectedValue };
                }
                return {
                    ok: false,
                    error: new ErrorSet<ValidationError>().add({
                        pointer,
                        detail: formatter.string.maxLength(0),
                    }),
                };
            }
        }
        if (this.#expectedValue === null) {
            if (value === '') {
                return { ok: true, value: this.#expectedValue };
            }
            return {
                ok: false,
                error: new ErrorSet<ValidationError>().add({
                    pointer,
                    detail: formatter.string.maxLength(0),
                }),
            };
        }
        return {
            ok: false,
            error: new ErrorSet<ValidationError>().add({
                pointer,
                detail: formatter.string.type(),
            }),
        };
    }
}
