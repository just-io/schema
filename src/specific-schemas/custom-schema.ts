import { ErrorFormatter } from '../error-formatter';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Defs, StringStructure, TypeSchema, ValidationError, withDefault } from '../schema';
import { Result } from '../result';
import { ErrorSet } from '../error-set';

export type CustomSchemaParams<T> = {
    validate(
        this: CustomSchema<T>,
        value: unknown,
        pointer: Pointer,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<T, ErrorSet<ValidationError>>;
    makeJSONSchema(
        this: CustomSchema<T>,
        pointer: Pointer,
        defs: Defs,
        lang: string,
    ): JSONSchemaValue;
    cast(
        this: CustomSchema<T>,
        value: StringStructure,
        pointer: Pointer,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<T, ErrorSet<ValidationError>>;
};

export default class CustomSchema<T> extends TypeSchema<T> {
    #params: CustomSchemaParams<T>;

    constructor(params: CustomSchemaParams<T>) {
        super();
        this.#params = params;
    }

    @withDefault
    validate(
        value: unknown,
        pointer: Pointer,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<T, ErrorSet<ValidationError>> {
        return this.#params.validate.call(this, value, pointer, formatter, useDefault);
    }

    makeJSONSchema(pointer: Pointer, defs: Defs, lang: string): JSONSchemaValue {
        return this.#params.makeJSONSchema.call(this, pointer, defs, lang);
    }

    @withDefault
    cast(
        value: StringStructure,
        pointer: Pointer,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<T, ErrorSet<ValidationError>> {
        return this.#params.cast.call(this, value, pointer, formatter, useDefault);
    }
}
