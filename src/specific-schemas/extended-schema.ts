import { dummyErrorKeeper, ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { BaseSchema, Defs, Schema } from '../schema';

export type SpecifyingValidator<T> = (value: T, errorKeeper: ErrorKeeper) => boolean;

export default class ExtendedSchema<T> extends BaseSchema<T> {
    #schema: Schema<T>;

    #specifyingValidators: SpecifyingValidator<T>[];

    constructor(schema: Schema<T>, ...specifyingValidators: SpecifyingValidator<T>[]) {
        super();
        this.#schema = schema;
        this.#specifyingValidators = specifyingValidators;
    }

    is(value: unknown, errorKeeper: ErrorKeeper = dummyErrorKeeper): value is T {
        if (!BaseSchema.callValidator(this.#schema, value, errorKeeper)) {
            return false;
        }
        let isCorrectedValue = true;
        for (const validator of this.#specifyingValidators) {
            if (!validator(value, errorKeeper)) {
                isCorrectedValue = false;
            }
        }

        return isCorrectedValue;
    }

    makeJSONSchema(pointer: Pointer, defs: Defs, lang: string): JSONSchemaValue {
        return BaseSchema.getSchema(this.#schema).makeJSONSchema(pointer, defs, lang);
    }
}
