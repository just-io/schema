import { ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Defs, Result, StringStructure, TypeSchema, withDefault } from '../schema';

export type CustomSchemaParams<T, L extends string> = {
    validate(
        this: CustomSchema<T, L>,
        value: unknown,
        lang: L,
        errorKeeper: ErrorKeeper<L>,
        useDefault: boolean,
    ): Result<T, unknown>;
    makeJSONSchema(
        this: CustomSchema<T, L>,
        pointer: Pointer,
        defs: Defs<L>,
        lang: L,
    ): JSONSchemaValue;
    cast(
        this: CustomSchema<T, L>,
        value: StringStructure,
        lang: L,
        errorKeeper: ErrorKeeper<L>,
        useDefault: boolean,
    ): Result<T, unknown>;
};

export default class CustomSchema<T, L extends string> extends TypeSchema<T, L> {
    #params: CustomSchemaParams<T, L>;

    constructor(params: CustomSchemaParams<T, L>) {
        super();
        this.#params = params;
    }

    @withDefault
    validate(
        value: unknown,
        lang: L,
        errorKeeper: ErrorKeeper<L>,
        useDefault: boolean,
    ): Result<T, unknown> {
        return this.#params.validate.call(this, value, lang, errorKeeper, useDefault);
    }

    makeJSONSchema(pointer: Pointer, defs: Defs<L>, lang: L): JSONSchemaValue {
        return this.#params.makeJSONSchema.call(this, pointer, defs, lang);
    }

    @withDefault
    cast(
        value: StringStructure,
        lang: L,
        errorKeeper: ErrorKeeper<L>,
        useDefault: boolean,
    ): Result<T, unknown> {
        return this.#params.cast.call(this, value, lang, errorKeeper, useDefault);
    }
}
