import { ErrorFormatter } from '../error-formatter';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Schema, Defs, StringStructure, withDefault, ValidationError } from '../schema';
import { Result } from '../result';
import { ErrorSet } from '../error-set';

export default class UndefinedSchema extends Schema<undefined> {
    @withDefault
    validate(
        value: unknown,
        pointer: Pointer,
        formatter: ErrorFormatter,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        useDefault: boolean,
    ): Result<undefined, ErrorSet<ValidationError>> {
        if (value !== undefined) {
            return {
                ok: false,
                error: new ErrorSet<ValidationError>().add({
                    pointer,
                    detail: formatter.undefined(),
                }),
            };
        }

        return { ok: true, value: undefined };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    makeJSONSchema(pointer: Pointer, defs: Defs, lang: string): JSONSchemaValue {
        return {};
    }

    @withDefault
    cast(
        value: StringStructure,
        pointer: Pointer,
        formatter: ErrorFormatter,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        useDefault: boolean,
    ): Result<undefined, ErrorSet<ValidationError>> {
        if (typeof value !== 'string') {
            return {
                ok: false,
                error: new ErrorSet<ValidationError>().add({
                    pointer,
                    detail: formatter.string.type(),
                }),
            };
        }
        if (value !== '') {
            return {
                ok: false,
                error: new ErrorSet<ValidationError>().add({
                    pointer,
                    detail: formatter.string.maxLength(0),
                }),
            };
        }

        return { ok: true, value: undefined };
    }
}
