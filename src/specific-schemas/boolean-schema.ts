import { ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Defs, TypeSchema } from '../schema';

export default class BooleanSchema<L extends string> extends TypeSchema<boolean, L> {
    validate(value: unknown, lang: L, errorKeeper: ErrorKeeper<L>): value is boolean {
        if (typeof value !== 'boolean') {
            errorKeeper.push(errorKeeper.formatters(lang).boolean());
            return false;
        }

        return true;
    }

    makeJSONSchema(pointer: Pointer, defs: Defs<L>, lang: L): JSONSchemaValue {
        return {
            type: 'boolean',
            title: this.getTitle(lang),
            description: this.getDescription(lang),
            defaut: this.getDefault(),
        };
    }
}
