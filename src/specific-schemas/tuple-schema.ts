import { dummyErrorKeeper, ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { TypeSchema, Schema, Defs } from '../schema';

export type TupleSchemas<T extends unknown[]> = {
    [I in keyof T]: Schema<T[I]>;
} & { length: T['length'] };

export default class TupleSchema<T extends unknown[]> extends TypeSchema<T> {
    #tupleSchemas: TupleSchemas<T>;

    constructor(...tupleSchemas: TupleSchemas<T>) {
        super();
        this.#tupleSchemas = tupleSchemas;
    }

    is(value: unknown, errorKeeper: ErrorKeeper = dummyErrorKeeper): value is T {
        if (!Array.isArray(value) || value.length !== this.#tupleSchemas.length) {
            errorKeeper.push(errorKeeper.formatters.array.type());
            return false;
        }
        let isCorrectedValues = true;
        for (let i = 0; i < this.#tupleSchemas.length; i++) {
            if (!TypeSchema.callValidator(this.#tupleSchemas[i], value[i], errorKeeper.child(i))) {
                isCorrectedValues = false;
            }
        }
        if (value.length > this.#tupleSchemas.length) {
            for (let i = this.#tupleSchemas.length; i < value.length; i++) {
                errorKeeper.push(errorKeeper.pointer.concat(i), errorKeeper.formatters.object.notexistField());
            }
            isCorrectedValues = false;
        }

        return isCorrectedValues;
    }

    makeJSONSchema(pointer: Pointer, defs: Defs, lang: string): JSONSchemaValue {
        return {
            type: 'array',
            title: this.getTitle(),
            description: this.getDescription(),
            prefixItems: this.#tupleSchemas.map((schema, i) => {
                return defs.collectSchema(pointer.concat(i), schema as Schema<unknown>, lang);
            }),
            defaut: this.getDefault(),
        };
    }
}
