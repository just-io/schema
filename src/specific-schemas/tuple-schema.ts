import { ErrorFormatter } from '../error-formatter';
import { ErrorKeeper, ValidationError } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { TypeSchema, Schema, Defs, StringStructure, withDefault } from '../schema';
import { Result } from '../result';
import { ErrorSet } from '../error-set';

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
    validate(
        value: unknown,
        errorKeeper: ErrorKeeper,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<T, ErrorSet<ValidationError>> {
        if (!Array.isArray(value)) {
            errorKeeper.push({ detail: formatter.array.type() });
            return { ok: false, error: errorKeeper.makeErrorSet() };
        }
        if (value.length > this.#tupleSchemas.length) {
            for (let i = this.#tupleSchemas.length; i < value.length; i++) {
                errorKeeper.push({
                    pointer: errorKeeper.pointer.concat(i),
                    detail: formatter.object.notexistField(),
                });
            }
            return { ok: false, error: errorKeeper.makeErrorSet() };
        }
        if (value.length !== this.#tupleSchemas.length) {
            errorKeeper.push({ detail: formatter.array.maxItems(this.#tupleSchemas.length) });
            errorKeeper.push({ detail: formatter.array.minItems(this.#tupleSchemas.length) });
            return { ok: false, error: errorKeeper.makeErrorSet() };
        }

        const itemValues: unknown[] = [];
        for (let i = 0; i < value.length; i++) {
            const result = this.#tupleSchemas[i].validate(
                value[i],
                errorKeeper.child(i),
                formatter,
                useDefault,
            );
            if (result.ok) {
                itemValues.push(result.value);
            } else {
                errorKeeper.append(result.error);
            }
        }
        if (errorKeeper.hasErrors()) {
            return { ok: false, error: errorKeeper.makeErrorSet() };
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
        errorKeeper: ErrorKeeper,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<T, ErrorSet<ValidationError>> {
        if (typeof value === 'string' || value === undefined || value instanceof File) {
            errorKeeper.push({ detail: formatter.array.type() });
            return { ok: false, error: errorKeeper.makeErrorSet() };
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
                errorKeeper.push({
                    pointer: errorKeeper.pointer.concat(i),
                    detail: formatter.object.notexistField(),
                });
            }
            return { ok: false, error: errorKeeper.makeErrorSet() };
        }
        if (array.length !== this.#tupleSchemas.length) {
            errorKeeper.push({ detail: formatter.array.maxItems(this.#tupleSchemas.length) });
            errorKeeper.push({ detail: formatter.array.minItems(this.#tupleSchemas.length) });
            return { ok: false, error: errorKeeper.makeErrorSet() };
        }

        const itemValues: unknown[] = [];
        for (let i = 0; i < array.length; i++) {
            const result = this.#tupleSchemas[i].cast(
                array[i],
                errorKeeper.child(i),
                formatter,
                useDefault,
            );
            if (result.ok) {
                itemValues.push(result.value);
            } else {
                errorKeeper.append(result.error);
            }
        }
        if (errorKeeper.hasErrors()) {
            return { ok: false, error: errorKeeper.makeErrorSet() };
        }

        return { ok: true, value: itemValues as T };
    }
}
