import { ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Defs, Schema } from '../schema';

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

    validate(value: unknown, lang: L, errorKeeper: ErrorKeeper<L>): value is T {
        if (!this.#schema.validate(value, lang, errorKeeper)) {
            return false;
        }
        let isCorrectedValue = true;
        for (const validator of this.#specifyingValidators) {
            if (!validator(value, lang, errorKeeper)) {
                isCorrectedValue = false;
            }
        }

        return isCorrectedValue;
    }

    makeJSONSchema(pointer: Pointer, defs: Defs<L>, lang: L): JSONSchemaValue {
        return this.#schema.makeJSONSchema(pointer, defs, lang);
    }
}
