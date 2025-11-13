import { ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Defs, Result, Schema, StringStructure, withDefault } from '../schema';

export default class LazySchema<T, L extends string> extends Schema<T, L> {
    #lazySchema: () => Schema<T, L>;

    constructor(lazySchema: () => Schema<T, L>) {
        super();
        this.#lazySchema = lazySchema;
    }

    @withDefault
    validate(value: unknown, errorKeeper: ErrorKeeper<L>, useDefault: boolean): Result<T, unknown> {
        return this.#lazySchema().validate(value, errorKeeper, useDefault);
    }

    makeJSONSchema(pointer: Pointer, defs: Defs<L>, lang: L): JSONSchemaValue {
        return defs.collectSchema(pointer, this.#lazySchema(), lang);
    }

    @withDefault
    cast(
        value: StringStructure,
        errorKeeper: ErrorKeeper<L>,
        useDefault: boolean,
    ): Result<T, unknown> {
        return this.#lazySchema().cast(value, errorKeeper, useDefault);
    }
}
