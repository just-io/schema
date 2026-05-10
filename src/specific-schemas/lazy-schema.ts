import { ErrorFormatter } from '../error-formatter';
import { ErrorKeeper, ValidationError } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Defs, Schema, StringStructure, withDefault } from '../schema';
import { Result } from '../result';
import { ErrorSet } from '../error-set';

export default class LazySchema<T, L extends string> extends Schema<T, L> {
    #lazySchema: () => Schema<T, L>;

    constructor(lazySchema: () => Schema<T, L>) {
        super();
        this.#lazySchema = lazySchema;
    }

    @withDefault
    validate(
        value: unknown,
        errorKeeper: ErrorKeeper,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<T, ErrorSet<ValidationError>> {
        return this.#lazySchema().validate(value, errorKeeper, formatter, useDefault);
    }

    makeJSONSchema(pointer: Pointer, defs: Defs<L>, lang: L): JSONSchemaValue {
        return defs.collectSchema(pointer, this.#lazySchema(), lang);
    }

    @withDefault
    cast(
        value: StringStructure,
        errorKeeper: ErrorKeeper,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<T, ErrorSet<ValidationError>> {
        return this.#lazySchema().cast(value, errorKeeper, formatter, useDefault);
    }
}
