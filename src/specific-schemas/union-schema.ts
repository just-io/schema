import { ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { TypeSchema, Schema, Defs } from '../schema';

export default class UnionSchema<T, L extends string> extends TypeSchema<T, L> {
    #schemas: Schema<T, L>[];

    constructor(...schemas: Schema<T, L>[]) {
        super();
        this.#schemas = schemas;
    }

    validate(value: unknown, lang: L, errorKeeper: ErrorKeeper<L>): value is T {
        const innerErrorKeeper = errorKeeper.fork();
        for (let i = 0; i < this.#schemas.length; i++) {
            const unionErrorKeeper = innerErrorKeeper.fork();
            unionErrorKeeper.group = i;
            if (this.#schemas[i].validate(value, lang, unionErrorKeeper)) {
                return true;
            }
            unionErrorKeeper.flush();
        }
        innerErrorKeeper.flush();

        return false;
    }

    makeJSONSchema(pointer: Pointer, defs: Defs<L>, lang: L): JSONSchemaValue {
        return {
            title: this.getTitle(lang),
            description: this.getDescription(lang),
            oneOf: this.#schemas.map((schema, i) =>
                schema.makeJSONSchema(pointer.concat(i), defs, lang),
            ),
            defaut: this.getDefault(),
        };
    }
}
