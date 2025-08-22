import { dummyErrorKeeper, ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { TypeSchema, Schema, Defs } from '../schema';

export default class UnionSchema<T> extends TypeSchema<T> {
    #schemas: Schema<T>[];

    constructor(...schemas: Schema<T>[]) {
        super();
        this.#schemas = schemas;
    }

    is(value: unknown, errorKeeper: ErrorKeeper = dummyErrorKeeper): value is T {
        const innerErrorKeeper = errorKeeper.fork();
        for (let i = 0; i < this.#schemas.length; i++) {
            const unionErrorKeeper = innerErrorKeeper.fork();
            unionErrorKeeper.group = i;
            if (TypeSchema.callValidator(this.#schemas[i], value, unionErrorKeeper)) {
                return true;
            }
            unionErrorKeeper.flush();
        }
        innerErrorKeeper.flush();

        return false;
    }

    makeJSONSchema(pointer: Pointer, defs: Defs, lang: string): JSONSchemaValue {
        return {
            title: this.getTitle(),
            description: this.getDescription(),
            oneOf: this.#schemas.map((schema, i) => defs.collectSchema(pointer.concat(i), schema, lang)),
            defaut: this.getDefault(),
        };
    }
}
