import { ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { TypeSchema, Schema, Defs, Result, StringStructure, withDefault } from '../schema';

export type TupleSchemas<T extends unknown[], L extends string> = {
    [I in keyof T]: Schema<T[I], L>;
} & { length: T['length'] };

export default class TupleSchema<T extends unknown[], L extends string> extends TypeSchema<T, L> {
    #tupleSchemas: TupleSchemas<T, L>;

    constructor(...tupleSchemas: TupleSchemas<T, L>) {
        super();
        this.#tupleSchemas = tupleSchemas;
    }

    @withDefault
    validate(value: unknown, errorKeeper: ErrorKeeper<L>, useDefault: boolean): Result<T, unknown> {
        if (!Array.isArray(value)) {
            errorKeeper.push(errorKeeper.formatter.array.type());
            return { ok: false, error: true };
        }
        if (value.length > this.#tupleSchemas.length) {
            for (let i = this.#tupleSchemas.length; i < value.length; i++) {
                errorKeeper.push(
                    errorKeeper.pointer.concat(i),
                    errorKeeper.formatter.object.notexistField(),
                );
            }
            return { ok: false, error: true };
        }
        if (value.length !== this.#tupleSchemas.length) {
            errorKeeper.push(errorKeeper.formatter.array.maxItems(this.#tupleSchemas.length));
            errorKeeper.push(errorKeeper.formatter.array.minItems(this.#tupleSchemas.length));
            return { ok: false, error: true };
        }

        const itemValues = value
            .map((item, i) =>
                this.#tupleSchemas[i].validate(item, errorKeeper.child(i), useDefault),
            )
            .filter((result) => result.ok)
            .map((result) => result.value);

        if (itemValues.length !== this.#tupleSchemas.length) {
            return { ok: false, error: true };
        }

        return { ok: true, value: itemValues as T };
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

    @withDefault
    cast(
        value: StringStructure,
        errorKeeper: ErrorKeeper<L>,
        useDefault: boolean,
    ): Result<T, unknown> {
        if (typeof value === 'string' || value === undefined || value instanceof File) {
            errorKeeper.push(errorKeeper.formatter.array.type());
            return { ok: false, error: true };
        }
        const array = Array.isArray(value)
            ? value
            : Array.from(
                  Object.entries(value).reduce((arr, [i, v]) => {
                      arr[i as unknown as number] = v;
                      return arr;
                  }, [] as StringStructure[]),
              );

        if (array.length > this.#tupleSchemas.length) {
            for (let i = this.#tupleSchemas.length; i < array.length; i++) {
                errorKeeper.push(
                    errorKeeper.pointer.concat(i),
                    errorKeeper.formatter.object.notexistField(),
                );
            }
            return { ok: false, error: true };
        }
        if (array.length !== this.#tupleSchemas.length) {
            errorKeeper.push(errorKeeper.formatter.array.maxItems(this.#tupleSchemas.length));
            errorKeeper.push(errorKeeper.formatter.array.minItems(this.#tupleSchemas.length));
            return { ok: false, error: true };
        }

        const itemValues = array
            .map((item, i) => this.#tupleSchemas[i].cast(item, errorKeeper.child(i), useDefault))
            .filter((result) => result.ok)
            .map((result) => result.value);

        if (itemValues.length !== this.#tupleSchemas.length) {
            return { ok: false, error: true };
        }

        return { ok: true, value: itemValues as T };
    }
}
