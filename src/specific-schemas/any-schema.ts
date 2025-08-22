import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Defs, TypeSchema } from '../schema';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default class AnySchema extends TypeSchema<any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    is(value: unknown): value is any {
        return true;
    }

    makeJSONSchema(pointer: Pointer, defs: Defs, lang: string): JSONSchemaValue {
        return {
            title: this.getTitle(lang),
            description: this.getDescription(lang),
            defaut: this.getDefault(),
        };
    }
}
