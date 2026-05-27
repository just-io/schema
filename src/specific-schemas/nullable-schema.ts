import { ErrorFormatter } from '../error-formatter';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Defs, Schema, StringStructure, ValidationError, withDefault } from '../schema';
import { Result } from '../result';
import { ErrorSet } from '../error-set';

export default class NullableSchema<T> extends Schema<T | null> {
    #schema: Schema<T>;

    constructor(schema: Schema<T>) {
        super();
        this.#schema = schema;
    }

    @withDefault
    validate(
        value: unknown,
        pointer: Pointer,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<T | null, ErrorSet<ValidationError>> {
        if (value === null) {
            return { ok: true, value: null };
        }

        return this.#schema.validate(value, pointer, formatter, useDefault);
    }

    makeJSONSchema(pointer: Pointer, defs: Defs, lang: string): JSONSchemaValue {
        return this.#schema.makeJSONSchema(pointer, defs, lang);
    }

    @withDefault
    cast(
        value: StringStructure,
        pointer: Pointer,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<T | null, ErrorSet<ValidationError>> {
        if (value === '' || value === undefined) {
            return { ok: true, value: null };
        }

        return this.#schema.cast(value, pointer, formatter, useDefault);
    }
}
