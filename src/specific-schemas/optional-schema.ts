import { dummyErrorKeeper, ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { BaseSchema, Defs, Schema } from '../schema';

export default class OptionalSchema<T> extends BaseSchema<T | undefined> {
    #schema: Schema<T>;

    constructor(schema: Schema<T>) {
        super();
        this.#schema = schema;
    }

    is(value: unknown, errorKeeper: ErrorKeeper = dummyErrorKeeper): value is T | undefined {
        if (value === undefined) {
            return true;
        }
        if (BaseSchema.callValidator(this.#schema, value, errorKeeper)) {
            return true;
        }

        return false;
    }

    makeJSONSchema(pointer: Pointer, defs: Defs, lang: string): JSONSchemaValue {
        return BaseSchema.getSchema(this.#schema).makeJSONSchema(pointer, defs, lang);
    }
}
