import { ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Defs, Result, StringStructure, TypeSchema, withDefault } from '../schema';

export default class UnknownSchema<L extends string> extends TypeSchema<unknown, L> {
    @withDefault
    validate(
        value: unknown,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        lang: L,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        errorKeeper: ErrorKeeper<L>,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        useDefault: boolean,
    ): Result<unknown, unknown> {
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
        lang: L,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        errorKeeper: ErrorKeeper<L>,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        useDefault: boolean,
    ): Result<unknown, unknown> {
        return { ok: true, value };
    }
}
