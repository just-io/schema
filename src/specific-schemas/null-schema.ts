import { ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Defs, Result, StringStructure, TypeSchema, withDefault } from '../schema';

export default class NullSchema<L extends string> extends TypeSchema<null, L> {
    @withDefault
    validate(
        value: unknown,
        errorKeeper: ErrorKeeper<L>,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        useDefault: boolean,
    ): Result<null, unknown> {
        if (value !== null) {
            errorKeeper.push(errorKeeper.formatter.null());
            return { ok: false, error: true };
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
        errorKeeper: ErrorKeeper<L>,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        useDefault: boolean,
    ): Result<null, unknown> {
        if (typeof value !== 'string') {
            errorKeeper.push(errorKeeper.formatter.string.type());
            return { ok: false, error: true };
        }
        if (value !== '') {
            errorKeeper.push(errorKeeper.formatter.string.maxLength(0));
            return { ok: false, error: true };
        }

        return { ok: true, value: null };
    }
}
