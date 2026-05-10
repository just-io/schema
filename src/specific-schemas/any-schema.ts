import { ErrorFormatter } from '../error-formatter';
import { ErrorKeeper, ValidationError } from '../error-keeper';
import { ErrorSet } from '../error-set';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Result } from '../result';
import { Defs, StringStructure, TypeSchema, withDefault } from '../schema';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default class AnySchema<L extends string> extends TypeSchema<any, L> {
    @withDefault
    validate(
        value: unknown,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        errorKeeper: ErrorKeeper,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        formatter: ErrorFormatter,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        useDefault: boolean,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Result<any, ErrorSet<ValidationError>> {
        return { ok: true, value };
    }

    makeJSONSchema(pointer: Pointer, defs: Defs<L>, lang: L): JSONSchemaValue {
        return {
            title: this.getTitle(lang),
            description: this.getDescription(lang),
            defaut: this.getDefault(),
        };
    }

    @withDefault
    cast(
        value: StringStructure,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        errorKeeper: ErrorKeeper,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        formatter: ErrorFormatter,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        useDefault: boolean,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Result<any, ErrorSet<ValidationError>> {
        return { ok: true, value };
    }
}
