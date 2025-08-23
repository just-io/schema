import { ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { BaseSchema, Defs, Schema } from '../schema';

export default class OptionalSchema<T, L extends string> extends BaseSchema<T | undefined, L> {
    #schema: Schema<T, L>;

    constructor(schema: Schema<T, L>) {
        super();
        this.#schema = schema;
    }

    validate(value: unknown, lang: L, errorKeeper: ErrorKeeper<L>): value is T | undefined {
        if (value === undefined) {
            return true;
        }
        if (BaseSchema.callValidator(this.#schema, value, lang, errorKeeper)) {
            return true;
        }

        return false;
    }

    makeJSONSchema(pointer: Pointer, defs: Defs<L>, lang: L): JSONSchemaValue {
        return BaseSchema.getSchema(this.#schema).makeJSONSchema(pointer, defs, lang);
    }
}
