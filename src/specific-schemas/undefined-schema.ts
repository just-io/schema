import { ErrorFormatter } from '../error-formatter';
import { ErrorKeeper, ValidationError } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Schema, Defs, StringStructure, withDefault } from '../schema';
import { Result } from '../result';
import { ErrorSet } from '../error-set';

export default class UndefinedSchema<L extends string> extends Schema<undefined, L> {
    @withDefault
    validate(
        value: unknown,
        errorKeeper: ErrorKeeper,
        formatter: ErrorFormatter,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        useDefault: boolean,
    ): Result<undefined, ErrorSet<ValidationError>> {
        if (value !== undefined) {
            errorKeeper.push({ detail: formatter.undefined() });
            return { ok: false, error: errorKeeper.makeErrorSet() };
        }

        return { ok: true, value: undefined };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    makeJSONSchema(pointer: Pointer, defs: Defs<L>, lang: L): JSONSchemaValue {
        return {};
    }

    @withDefault
    cast(
        value: StringStructure,
        errorKeeper: ErrorKeeper,
        formatter: ErrorFormatter,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        useDefault: boolean,
    ): Result<undefined, ErrorSet<ValidationError>> {
        if (typeof value !== 'string') {
            errorKeeper.push({ detail: formatter.string.type() });
            return { ok: false, error: errorKeeper.makeErrorSet() };
        }
        if (value !== '') {
            errorKeeper.push({ detail: formatter.string.maxLength(0) });
            return { ok: false, error: errorKeeper.makeErrorSet() };
        }

        return { ok: true, value: undefined };
    }
}
