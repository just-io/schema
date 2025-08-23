import { ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Defs, TypeSchema } from '../schema';

export default class NullSchema<L extends string> extends TypeSchema<null, L> {
    validate(value: unknown, lang: L, errorKeeper: ErrorKeeper<L>): value is null {
        if (value !== null) {
            errorKeeper.push(errorKeeper.formatters(lang).null());
            return false;
        }

        return true;
    }

    makeJSONSchema(pointer: Pointer, defs: Defs<L>, lang: L): JSONSchemaValue {
        return {
            type: 'null',
            title: this.getTitle(lang),
            description: this.getDescription(lang),
            defaut: this.getDefault(),
        };
    }
}
