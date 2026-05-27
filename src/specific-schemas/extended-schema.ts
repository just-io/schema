import { ErrorFormatter } from '../error-formatter';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Defs, Schema, StringStructure, ValidationError, withDefault } from '../schema';
import { Result } from '../result';
import { ErrorSet } from '../error-set';

export type SpecifyingValidator<T> = (value: T, lang: string) => Result<true, string>;

export default class ExtendedSchema<T> extends Schema<T> {
    #schema: Schema<T>;

    #specifyingValidators: SpecifyingValidator<T>[];

    constructor(schema: Schema<T>, ...specifyingValidators: SpecifyingValidator<T>[]) {
        super();
        this.#schema = schema;
        this.#specifyingValidators = specifyingValidators;
    }

    @withDefault
    validate(
        value: unknown,
        pointer: Pointer,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<T, ErrorSet<ValidationError>> {
        const result = this.#schema.validate(value, pointer, formatter, useDefault);
        if (!result.ok) {
            return result;
        }
        const errorSet = new ErrorSet<ValidationError>();
        for (const validator of this.#specifyingValidators) {
            const validatorResult = validator(result.value, formatter.lang);
            if (!validatorResult.ok) {
                errorSet.add({
                    pointer,
                    detail: validatorResult.error,
                });
            }
        }

        return errorSet.empty()
            ? { ok: true, value: result.value }
            : { ok: false, error: errorSet };
    }

    makeJSONSchema(pointer: Pointer, defs: Defs, lang: string): JSONSchemaValue {
        return this.#schema.makeJSONSchema(pointer, defs, lang);
    }

    @withDefault
    cast(
        value: StringStructure,
        pointer: Pointer,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<T, ErrorSet<ValidationError>> {
        const result = this.#schema.cast(value, pointer, formatter, useDefault);
        if (!result.ok) {
            return result;
        }
        const errorSet = new ErrorSet<ValidationError>();
        for (const validator of this.#specifyingValidators) {
            const validatorResult = validator(result.value, formatter.lang);
            if (!validatorResult.ok) {
                errorSet.add({
                    pointer,
                    detail: validatorResult.error,
                });
            }
        }

        return errorSet.empty()
            ? { ok: true, value: result.value }
            : { ok: false, error: errorSet };
    }
}
