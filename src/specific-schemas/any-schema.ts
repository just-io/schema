import { ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Defs, TypeSchema } from '../schema';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default class AnySchema<L extends string> extends TypeSchema<any, L> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    validate(value: unknown, _lang: L, _errorKeeper: ErrorKeeper<L>): value is any {
        return true;
    }

    makeJSONSchema(pointer: Pointer, defs: Defs<L>, lang: L): JSONSchemaValue {
        return {
            title: this.getTitle(lang),
            description: this.getDescription(lang),
            defaut: this.getDefault(),
        };
    }
}
