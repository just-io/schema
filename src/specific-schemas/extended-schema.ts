import { ErrorFormatter } from '../error-formatter';
import { ErrorKeeper, ValidationError } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Defs, Schema, StringStructure, withDefault } from '../schema';
import { Result } from '../result';
import { ErrorSet } from '../error-set';

export type SpecifyingValidator<T, L extends string> = (
    value: T,
    lang: L,
    errorKeeper: ErrorKeeper,
) => boolean;

export default class ExtendedSchema<T, L extends string> extends Schema<T, L> {
    #schema: Schema<T, L>;

    #specifyingValidators: SpecifyingValidator<T, L>[];

    constructor(schema: Schema<T, L>, ...specifyingValidators: SpecifyingValidator<T, L>[]) {
        super();
        this.#schema = schema;
        this.#specifyingValidators = specifyingValidators;
    }

    @withDefault
    validate(
        value: unknown,
        errorKeeper: ErrorKeeper,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<T, ErrorSet<ValidationError>> {
        const result = this.#schema.validate(value, errorKeeper, formatter, useDefault);
        if (!result.ok) {
            return { ok: false, error: errorKeeper.makeErrorSet() };
        }
        let isCorrectedValue = true;
        for (const validator of this.#specifyingValidators) {
            if (!validator(result.value, errorKeeper.lang as L, errorKeeper as ErrorKeeper)) {
                isCorrectedValue = false;
            }
        }

        return isCorrectedValue
            ? { ok: true, value: result.value }
            : { ok: false, error: errorKeeper.makeErrorSet() };
    }

    makeJSONSchema(pointer: Pointer, defs: Defs<L>, lang: L): JSONSchemaValue {
        return this.#schema.makeJSONSchema(pointer, defs, lang);
    }

    @withDefault
    cast(
        value: StringStructure,
        errorKeeper: ErrorKeeper,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<T, ErrorSet<ValidationError>> {
        const result = this.#schema.cast(value, errorKeeper, formatter, useDefault);
        if (!result.ok) {
            return { ok: false, error: errorKeeper.makeErrorSet() };
        }
        let isCorrectedValue = true;
        for (const validator of this.#specifyingValidators) {
            if (!validator(result.value, errorKeeper.lang as L, errorKeeper as ErrorKeeper)) {
                isCorrectedValue = false;
            }
        }

        return isCorrectedValue
            ? { ok: true, value: result.value }
            : { ok: false, error: errorKeeper.makeErrorSet() };
    }
}
