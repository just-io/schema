import { ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Defs, Schema } from '../schema';

export default class OptionalSchema<T, L extends string> extends Schema<T | undefined, L> {
    #schema: Schema<T, L>;

    constructor(schema: Schema<T, L>) {
        super();
        this.#schema = schema;
    }

    validate(value: unknown, lang: L, errorKeeper: ErrorKeeper<L>): value is T | undefined {
        if (value === undefined) {
            return true;
        }
        if (this.#schema.validate(value, lang, errorKeeper)) {
            return true;
        }

        return false;
    }

    makeJSONSchema(pointer: Pointer, defs: Defs<L>, lang: L): JSONSchemaValue {
        return this.#schema.makeJSONSchema(pointer, defs, lang);
    }
}
