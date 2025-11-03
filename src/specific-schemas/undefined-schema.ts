import { ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Schema, Defs, Result, StringStructure, withDefault } from '../schema';

export default class UndefinedSchema<L extends string> extends Schema<undefined, L> {
    @withDefault
    validate(
        value: unknown,
        lang: L,
        errorKeeper: ErrorKeeper<L>,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        useDefault: boolean,
    ): Result<undefined, unknown> {
        if (value !== undefined) {
            errorKeeper.push(errorKeeper.formatters(lang).undefined());
            return { ok: false, error: true };
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
        lang: L,
        errorKeeper: ErrorKeeper<L>,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        useDefault: boolean,
    ): Result<undefined, unknown> {
        if (typeof value !== 'string') {
            errorKeeper.push(errorKeeper.formatters(lang).string.type());
            return { ok: false, error: true };
        }
        if (value !== '') {
            errorKeeper.push(errorKeeper.formatters(lang).string.maxLength(0));
            return { ok: false, error: true };
        }

        return { ok: true, value: undefined };
    }
}
