import { ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Defs, Result, StringStructure, TypeSchema, withDefault } from '../schema';

export default class BooleanSchema<L extends string> extends TypeSchema<boolean, L> {
    @withDefault
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    validate(
        value: unknown,
        lang: L,
        errorKeeper: ErrorKeeper<L>,
        useDefault: boolean,
    ): Result<boolean, unknown> {
        if (typeof value !== 'boolean') {
            errorKeeper.push(errorKeeper.formatters(lang).boolean());
            return { ok: false, error: true };
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
        lang: L,
        errorKeeper: ErrorKeeper<L>,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        useDefault: boolean,
    ): Result<boolean, unknown> {
        if (typeof value !== 'string') {
            errorKeeper.push(errorKeeper.formatters(lang).string.type());
            return { ok: false, error: true };
        }
        return { ok: true, value: value !== '' };
    }
}
