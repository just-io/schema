import { ErrorFormatter } from '../error-formatter';
import { ErrorKeeper, ValidationError } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Defs, StringStructure, TypeSchema, withDefault } from '../schema';
import { Result } from '../result';
import { ErrorSet } from '../error-set';

export type CustomSchemaParams<T, L extends string> = {
    validate(
        this: CustomSchema<T, L>,
        value: unknown,
        errorKeeper: ErrorKeeper,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<T, ErrorSet<ValidationError>>;
    makeJSONSchema(
        this: CustomSchema<T, L>,
        pointer: Pointer,
        defs: Defs<L>,
        lang: L,
    ): JSONSchemaValue;
    cast(
        this: CustomSchema<T, L>,
        value: StringStructure,
        errorKeeper: ErrorKeeper,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<T, ErrorSet<ValidationError>>;
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
        errorKeeper: ErrorKeeper,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<T, ErrorSet<ValidationError>> {
        return this.#params.validate.call(this, value, errorKeeper, formatter, useDefault);
    }

    makeJSONSchema(pointer: Pointer, defs: Defs<L>, lang: L): JSONSchemaValue {
        return this.#params.makeJSONSchema.call(this, pointer, defs, lang);
    }

    @withDefault
    cast(
        value: StringStructure,
        errorKeeper: ErrorKeeper,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<T, ErrorSet<ValidationError>> {
        return this.#params.cast.call(this, value, errorKeeper, formatter, useDefault);
    }
}
