import { ErrorFormatter } from '../error-formatter';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Defs, Schema, StringStructure, ValidationError, withDefault } from '../schema';
import { Result } from '../result';
import { ErrorSet } from '../error-set';

export default class LazySchema<T> extends Schema<T> {
    #lazySchema: () => Schema<T>;

    constructor(lazySchema: () => Schema<T>) {
        super();
        this.#lazySchema = lazySchema;
    }

    @withDefault
    validate(
        value: unknown,
        pointer: Pointer,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<T, ErrorSet<ValidationError>> {
        return this.#lazySchema().validate(value, pointer, formatter, useDefault);
    }

    makeJSONSchema(pointer: Pointer, defs: Defs, lang: string): JSONSchemaValue {
        return defs.collectSchema(pointer, this.#lazySchema(), lang);
    }

    @withDefault
    cast(
        value: StringStructure,
        pointer: Pointer,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<T, ErrorSet<ValidationError>> {
        return this.#lazySchema().cast(value, pointer, formatter, useDefault);
    }
}
