import { ErrorFormatter } from '../error-formatter';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { TypeSchema, Schema, Defs, StringStructure, withDefault, ValidationError } from '../schema';
import { Result } from '../result';
import { ErrorSet } from '../error-set';

export type TupleSchemas<T extends unknown[]> = {
    [I in keyof T]: Schema<T[I]>;
} & { length: T['length'] };

export default class TupleSchema<T extends unknown[]> extends TypeSchema<T> {
    #tupleSchemas: TupleSchemas<T>;

    constructor(...tupleSchemas: TupleSchemas<T>) {
        super();
        this.#tupleSchemas = tupleSchemas;
    }

    @withDefault
    validate(
        value: unknown,
        pointer: Pointer,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<T, ErrorSet<ValidationError>> {
        if (!Array.isArray(value)) {
            return {
                ok: false,
                error: new ErrorSet<ValidationError>().add({
                    pointer,
                    detail: formatter.array.type(),
                }),
            };
        }
        const errorSet = new ErrorSet<ValidationError>();
        if (value.length > this.#tupleSchemas.length) {
            for (let i = this.#tupleSchemas.length; i < value.length; i++) {
                errorSet.add({
                    pointer: pointer.concat(i),
                    detail: formatter.object.notexistField(),
                });
            }
            return { ok: false, error: errorSet };
        }
        if (value.length !== this.#tupleSchemas.length) {
            errorSet.add({ pointer, detail: formatter.array.maxItems(this.#tupleSchemas.length) });
            errorSet.add({ pointer, detail: formatter.array.minItems(this.#tupleSchemas.length) });
            return { ok: false, error: errorSet };
        }

        const itemValues: unknown[] = [];
        for (let i = 0; i < value.length; i++) {
            const result = this.#tupleSchemas[i].validate(
                value[i],
                pointer.concat(i),
                formatter,
                useDefault,
            );
            if (result.ok) {
                itemValues.push(result.value);
            } else {
                errorSet.append(result.error);
            }
        }
        if (errorSet.hasErrors()) {
            return { ok: false, error: errorSet };
        }

        return { ok: true, value: itemValues as T };
    }

    makeJSONSchema(pointer: Pointer, defs: Defs, lang: string): JSONSchemaValue {
        return {
            type: 'array',
            title: this.getTitle(lang),
            description: this.getDescription(lang),
            prefixItems: this.#tupleSchemas.map((schema, i) => {
                return (schema as Schema<unknown>).makeJSONSchema(pointer.concat(i), defs, lang);
            }),
            defaut: this.getDefault(),
        };
    }

    @withDefault
    cast(
        value: StringStructure,
        pointer: Pointer,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<T, ErrorSet<ValidationError>> {
        if (typeof value === 'string' || value === undefined || value instanceof File) {
            return {
                ok: false,
                error: new ErrorSet<ValidationError>().add({
                    pointer,
                    detail: formatter.array.type(),
                }),
            };
        }
        const errorSet = new ErrorSet<ValidationError>();
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
                errorSet.add({
                    pointer: pointer.concat(i),
                    detail: formatter.object.notexistField(),
                });
            }
            return { ok: false, error: errorSet };
        }
        if (array.length !== this.#tupleSchemas.length) {
            errorSet.add({ pointer, detail: formatter.array.maxItems(this.#tupleSchemas.length) });
            errorSet.add({ pointer, detail: formatter.array.minItems(this.#tupleSchemas.length) });
            return { ok: false, error: errorSet };
        }

        const itemValues: unknown[] = [];
        for (let i = 0; i < array.length; i++) {
            const result = this.#tupleSchemas[i].cast(
                array[i],
                pointer.concat(i),
                formatter,
                useDefault,
            );
            if (result.ok) {
                itemValues.push(result.value);
            } else {
                errorSet.append(result.error);
            }
        }
        if (errorSet.hasErrors()) {
            return { ok: false, error: errorSet };
        }

        return { ok: true, value: itemValues as T };
    }
}
