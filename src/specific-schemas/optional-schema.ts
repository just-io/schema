import { ErrorFormatter } from '../error-formatter';
import { ErrorKeeper, ValidationError } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Defs, Schema, StringStructure, withDefault } from '../schema';
import { Result } from '../result';
import { ErrorSet } from '../error-set';

export default class OptionalSchema<T, L extends string> extends Schema<T | undefined, L> {
    #schema: Schema<T, L>;

    constructor(schema: Schema<T, L>) {
        super();
        this.#schema = schema;
    }

    @withDefault
    validate(
        value: unknown,
        errorKeeper: ErrorKeeper,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<T | undefined, ErrorSet<ValidationError>> {
        if (value === undefined) {
            return { ok: true, value: undefined };
        }

        return this.#schema.validate(value, errorKeeper, formatter, useDefault);
    }

    makeJSONSchema(pointer: Pointer, defs: Defs<L>, lang: L): JSONSchemaValue {
        return this.#schema.makeJSONSchema(pointer, defs, lang);
    }

    @withDefault
    cast(
        value: StringStructure,
        errorKeeper: ErrorKeeper,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<T | undefined, ErrorSet<ValidationError>> {
        if (value === '' || value === undefined) {
            return { ok: true, value: undefined };
        }

        return this.#schema.cast(value, errorKeeper, formatter, useDefault);
    }
}
