import { ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Defs, Schema } from '../schema';

export default class LazySchema<T, L extends string> extends Schema<T, L> {
    #lazySchema: () => Schema<T, L>;

    constructor(lazySchema: () => Schema<T, L>) {
        super();
        this.#lazySchema = lazySchema;
    }

    validate(value: unknown, lang: L, errorKeeper: ErrorKeeper<L>): value is T {
        return this.#lazySchema().validate(value, lang, errorKeeper);
    }

    makeJSONSchema(pointer: Pointer, defs: Defs<L>, lang: L): JSONSchemaValue {
        return defs.collectSchema(pointer, this.#lazySchema(), lang);
    }
}
