import { ErrorFormatter } from '../error-formatter';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Defs, StringStructure, TypeSchema, ValidationError, withDefault } from '../schema';
import { Result } from '../result';
import { ErrorSet } from '../error-set';

export default class NullSchema extends TypeSchema<null> {
    @withDefault
    validate(
        value: unknown,
        pointer: Pointer,
        formatter: ErrorFormatter,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        useDefault: boolean,
    ): Result<null, ErrorSet<ValidationError>> {
        if (value !== null) {
            return {
                ok: false,
                error: new ErrorSet<ValidationError>().add({ pointer, detail: formatter.null() }),
            };
        }

        return { ok: true, value: null };
    }

    makeJSONSchema(pointer: Pointer, defs: Defs, lang: string): JSONSchemaValue {
        return {
            type: 'null',
            title: this.getTitle(lang),
            description: this.getDescription(lang),
            default: this.getDefault(),
        };
    }

    @withDefault
    cast(
        value: StringStructure,
        pointer: Pointer,
        formatter: ErrorFormatter,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        useDefault: boolean,
    ): Result<null, ErrorSet<ValidationError>> {
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

        return { ok: true, value: null };
    }
}
