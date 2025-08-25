import { ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { TypeSchema, Schema, Defs } from '../schema';

export type TupleSchemas<T extends unknown[], L extends string> = {
    [I in keyof T]: Schema<T[I], L>;
} & { length: T['length'] };

export default class TupleSchema<T extends unknown[], L extends string> extends TypeSchema<T, L> {
    #tupleSchemas: TupleSchemas<T, L>;

    constructor(...tupleSchemas: TupleSchemas<T, L>) {
        super();
        this.#tupleSchemas = tupleSchemas;
    }

    validate(value: unknown, lang: L, errorKeeper: ErrorKeeper<L>): value is T {
        if (!Array.isArray(value) || value.length !== this.#tupleSchemas.length) {
            errorKeeper.push(errorKeeper.formatters(lang).array.type());
            return false;
        }
        let isCorrectedValues = true;
        for (let i = 0; i < this.#tupleSchemas.length; i++) {
            if (!this.#tupleSchemas[i].validate(value[i], lang, errorKeeper.child(i))) {
                isCorrectedValues = false;
            }
        }
        if (value.length > this.#tupleSchemas.length) {
            for (let i = this.#tupleSchemas.length; i < value.length; i++) {
                errorKeeper.push(
                    errorKeeper.pointer.concat(i),
                    errorKeeper.formatters(lang).object.notexistField(),
                );
            }
            isCorrectedValues = false;
        }

        return isCorrectedValues;
    }

    makeJSONSchema(pointer: Pointer, defs: Defs<L>, lang: L): JSONSchemaValue {
        return {
            type: 'array',
            title: this.getTitle(lang),
            description: this.getDescription(lang),
            prefixItems: this.#tupleSchemas.map((schema, i) => {
                return (schema as Schema<unknown, L>).makeJSONSchema(pointer.concat(i), defs, lang);
            }),
            defaut: this.getDefault(),
        };
    }
}
