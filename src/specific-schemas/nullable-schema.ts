import { ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Defs, Result, Schema, StringStructure, withDefault } from '../schema';

export default class NullableSchema<T, L extends string> extends Schema<T | null, L> {
    #schema: Schema<T, L>;

    constructor(schema: Schema<T, L>) {
        super();
        this.#schema = schema;
    }

    @withDefault
    validate(
        value: unknown,
        errorKeeper: ErrorKeeper<L>,
        useDefault: boolean,
    ): Result<T | null, unknown> {
        if (value === null) {
            return { ok: true, value: null };
        }

        return this.#schema.validate(value, errorKeeper, useDefault);
    }

    makeJSONSchema(pointer: Pointer, defs: Defs<L>, lang: L): JSONSchemaValue {
        return this.#schema.makeJSONSchema(pointer, defs, lang);
    }

    @withDefault
    cast(
        value: StringStructure,
        errorKeeper: ErrorKeeper<L>,
        useDefault: boolean,
    ): Result<T | null, unknown> {
        if (value === '' || value === undefined) {
            return { ok: true, value: null };
        }

        return this.#schema.cast(value, errorKeeper, useDefault);
    }
}
