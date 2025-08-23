import { ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { BaseSchema, Defs, Schema } from '../schema';

export type SpecifyingValidator<T, L extends string> = (
    value: T,
    lang: L,
    errorKeeper: ErrorKeeper<L>,
) => boolean;

export default class ExtendedSchema<T, L extends string> extends BaseSchema<T, L> {
    #schema: Schema<T, L>;

    #specifyingValidators: SpecifyingValidator<T, L>[];

    constructor(schema: Schema<T, L>, ...specifyingValidators: SpecifyingValidator<T, L>[]) {
        super();
        this.#schema = schema;
        this.#specifyingValidators = specifyingValidators;
    }

    validate(value: unknown, lang: L, errorKeeper: ErrorKeeper<L>): value is T {
        if (!BaseSchema.callValidator(this.#schema, value, lang, errorKeeper)) {
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
        return BaseSchema.getSchema(this.#schema).makeJSONSchema(pointer, defs, lang);
    }
}
