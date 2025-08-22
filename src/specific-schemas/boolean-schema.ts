import { dummyErrorKeeper, ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Defs, TypeSchema } from '../schema';

export default class BooleanSchema extends TypeSchema<boolean> {
    is(value: unknown, errorKeeper: ErrorKeeper = dummyErrorKeeper): value is boolean {
        if (typeof value !== 'boolean') {
            errorKeeper.push(errorKeeper.formatters.boolean());
            return false;
        }

        return true;
    }

    makeJSONSchema(pointer: Pointer, defs: Defs, lang: string): JSONSchemaValue {
        return {
            type: 'boolean',
            title: this.getTitle(lang),
            description: this.getDescription(lang),
            defaut: this.getDefault(),
        };
    }
}
