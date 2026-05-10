import { ErrorFormatter } from '../error-formatter';
import { ErrorKeeper, ValidationError } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Defs, StringStructure, TypeSchema, withDefault } from '../schema';
import { Result } from '../result';
import { ErrorSet } from '../error-set';

export default class NullSchema<L extends string> extends TypeSchema<null, L> {
    @withDefault
    validate(
        value: unknown,
        errorKeeper: ErrorKeeper,
        formatter: ErrorFormatter,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        useDefault: boolean,
    ): Result<null, ErrorSet<ValidationError>> {
        if (value !== null) {
            errorKeeper.push({ detail: formatter.null() });
            return { ok: false, error: errorKeeper.makeErrorSet() };
        }

        return { ok: true, value: null };
    }

    makeJSONSchema(pointer: Pointer, defs: Defs<L>, lang: L): JSONSchemaValue {
        return {
            type: 'null',
            title: this.getTitle(lang),
            description: this.getDescription(lang),
            defaut: this.getDefault(),
        };
    }

    @withDefault
    cast(
        value: StringStructure,
        errorKeeper: ErrorKeeper,
        formatter: ErrorFormatter,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        useDefault: boolean,
    ): Result<null, ErrorSet<ValidationError>> {
        if (typeof value !== 'string') {
            errorKeeper.push({ detail: formatter.string.type() });
            return { ok: false, error: errorKeeper.makeErrorSet() };
        }
        if (value !== '') {
            errorKeeper.push({ detail: formatter.string.maxLength(0) });
            return { ok: false, error: errorKeeper.makeErrorSet() };
        }

        return { ok: true, value: null };
    }
}
