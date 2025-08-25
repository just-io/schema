import { ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Schema, Defs } from '../schema';

export default class UndefinedSchema<L extends string> extends Schema<undefined, L> {
    validate(value: unknown, lang: L, errorKeeper: ErrorKeeper<L>): value is undefined {
        if (value !== undefined) {
            errorKeeper.push(errorKeeper.formatters(lang).undefined());
            return false;
        }

        return true;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    makeJSONSchema(_pointer: Pointer, _defs: Defs<L>, _lang: L): JSONSchemaValue {
        return {};
    }
}
