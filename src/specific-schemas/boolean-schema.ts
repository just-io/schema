import { ErrorFormatter } from '../error-formatter';
import { ErrorSet } from '../error-set';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Result } from '../result';
import { Defs, StringStructure, TypeSchema, ValidationError, withDefault } from '../schema';

export default class BooleanSchema extends TypeSchema<boolean> {
    @withDefault
    validate(
        value: unknown,
        pointer: Pointer,
        formatter: ErrorFormatter,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        useDefault: boolean,
    ): Result<boolean, ErrorSet<ValidationError>> {
        if (typeof value !== 'boolean') {
            return {
                ok: false,
                error: new ErrorSet<ValidationError>().add({
                    pointer,
                    detail: formatter.boolean(),
                }),
            };
        }

        return { ok: true, value };
    }

    makeJSONSchema(pointer: Pointer, defs: Defs, lang: string): JSONSchemaValue {
        return {
            type: 'boolean',
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
    ): Result<boolean, ErrorSet<ValidationError>> {
        if (typeof value !== 'string') {
            return {
                ok: false,
                error: new ErrorSet<ValidationError>().add({
                    pointer,
                    detail: formatter.string.type(),
                }),
            };
        }
        return { ok: true, value: value !== '' };
    }
}
