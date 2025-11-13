import { ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Defs, Result, Schema, StringStructure, withDefault } from '../schema';

export type SpecifyingValidator<T, L extends string> = (
    value: T,
    lang: L,
    errorKeeper: ErrorKeeper<L>,
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
    validate(value: unknown, errorKeeper: ErrorKeeper<L>, useDefault: boolean): Result<T, unknown> {
        const result = this.#schema.validate(value, errorKeeper, useDefault);
        if (!result.ok) {
            return { ok: false, error: true };
        }
        let isCorrectedValue = true;
        for (const validator of this.#specifyingValidators) {
            if (!validator(result.value, errorKeeper.lang as L, errorKeeper as ErrorKeeper<L>)) {
                isCorrectedValue = false;
            }
        }

        return isCorrectedValue ? { ok: true, value: result.value } : { ok: false, error: true };
    }

    makeJSONSchema(pointer: Pointer, defs: Defs<L>, lang: L): JSONSchemaValue {
        return this.#schema.makeJSONSchema(pointer, defs, lang);
    }

    @withDefault
    cast(
        value: StringStructure,
        errorKeeper: ErrorKeeper<L>,
        useDefault: boolean,
    ): Result<T, unknown> {
        const result = this.#schema.cast(value, errorKeeper, useDefault);
        if (!result.ok) {
            return { ok: false, error: true };
        }
        let isCorrectedValue = true;
        for (const validator of this.#specifyingValidators) {
            if (!validator(result.value, errorKeeper.lang as L, errorKeeper as ErrorKeeper<L>)) {
                isCorrectedValue = false;
            }
        }

        return isCorrectedValue ? { ok: true, value: result.value } : { ok: false, error: true };
    }
}
