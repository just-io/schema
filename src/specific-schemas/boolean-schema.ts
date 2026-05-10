import { ErrorFormatter } from '../error-formatter';
import { ErrorKeeper, ValidationError } from '../error-keeper';
import { ErrorSet } from '../error-set';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Result } from '../result';
import { Defs, StringStructure, TypeSchema, withDefault } from '../schema';

export default class BooleanSchema<L extends string> extends TypeSchema<boolean, L> {
    @withDefault
    validate(
        value: unknown,
        errorKeeper: ErrorKeeper,
        formatter: ErrorFormatter,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        useDefault: boolean,
    ): Result<boolean, ErrorSet<ValidationError>> {
        if (typeof value !== 'boolean') {
            errorKeeper.push({ detail: formatter.boolean() });
            return { ok: false, error: errorKeeper.makeErrorSet() };
        }

        return { ok: true, value };
    }

    makeJSONSchema(pointer: Pointer, defs: Defs<L>, lang: L): JSONSchemaValue {
        return {
            type: 'boolean',
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
    ): Result<boolean, ErrorSet<ValidationError>> {
        if (typeof value !== 'string') {
            errorKeeper.push({ detail: formatter.string.type() });
            return { ok: false, error: errorKeeper.makeErrorSet() };
        }
        return { ok: true, value: value !== '' };
    }
}
