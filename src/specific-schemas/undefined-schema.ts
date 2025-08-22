import { dummyErrorKeeper, ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { BaseSchema, Defs } from '../schema';

export default class UndefinedSchema extends BaseSchema<undefined> {
    is(value: unknown, errorKeeper: ErrorKeeper = dummyErrorKeeper): value is undefined {
        if (value !== undefined) {
            errorKeeper.push(errorKeeper.formatters.undefined());
            return false;
        }

        return true;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    makeJSONSchema(_pointer: Pointer, _defs: Defs, _lang: string): JSONSchemaValue {
        return {};
    }
}
