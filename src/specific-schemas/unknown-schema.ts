import { ErrorFormatter } from '../error-formatter';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Defs, StringStructure, TypeSchema, ValidationError, withDefault } from '../schema';
import { Result } from '../result';
import { ErrorSet } from '../error-set';

export default class UnknownSchema extends TypeSchema<unknown> {
    @withDefault
    validate(
        value: unknown,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        pointer: Pointer,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        formatter: ErrorFormatter,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        useDefault: boolean,
    ): Result<unknown, ErrorSet<ValidationError>> {
        return { ok: true, value };
    }

    makeJSONSchema(pointer: Pointer, defs: Defs, lang: string): JSONSchemaValue {
        return {
            title: this.getTitle(lang),
            description: this.getDescription(lang),
            default: this.getDefault(),
        };
    }

    @withDefault
    cast(
        value: StringStructure,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        pointer: Pointer,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        formatter: ErrorFormatter,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        useDefault: boolean,
    ): Result<unknown, ErrorSet<ValidationError>> {
        return { ok: true, value };
    }
}
