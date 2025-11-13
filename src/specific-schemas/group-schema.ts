import { ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { TypeSchema, Schema, Defs, StringStructure, Result, withDefault } from '../schema';

export type GroupSchemas<T, K extends keyof T & string, L extends string> = T[K] extends string
    ? {
          [F in T[K]]: T extends { [IK in K]: F } ? Schema<T, L> : never;
      }
    : never;

export default class GroupSchema<
    T,
    K extends keyof T & string,
    L extends string,
> extends TypeSchema<T, L> {
    #key: string;

    #groupSchemas: GroupSchemas<T, K, L>;

    constructor(key: K, groupSchemas: GroupSchemas<T, K, L>) {
        super();
        this.#key = key;
        this.#groupSchemas = groupSchemas;
    }

    @withDefault
    validate(value: unknown, errorKeeper: ErrorKeeper<L>, useDefault: boolean): Result<T, unknown> {
        if (typeof value !== 'object' || value === null) {
            errorKeeper.push(errorKeeper.formatter.object.type());
            return { ok: false, error: true };
        }
        if (!(this.#key in value)) {
            errorKeeper.push(
                errorKeeper.pointer.concat(this.#key),
                errorKeeper.formatter.object.existField(),
            );
            return { ok: false, error: true };
        }
        const type = (value as Record<string, string>)[this.#key as string];
        if (!(type in this.#groupSchemas)) {
            errorKeeper.push(
                errorKeeper.pointer.concat(this.#key),
                errorKeeper.formatter.object.oneOf(Object.keys(this.#groupSchemas)),
            );
            return { ok: false, error: true };
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (this.#groupSchemas[type as keyof GroupSchemas<T, K, L>] as Schema<any, L>).validate(
            value,
            errorKeeper,
            useDefault,
        );
    }

    makeJSONSchema(pointer: Pointer, defs: Defs<L>, lang: L): JSONSchemaValue {
        return {
            title: this.getTitle(lang),
            description: this.getDescription(lang),
            oneOf: Object.entries(this.#groupSchemas).map(([key, schema]) =>
                (schema as Schema<unknown, L>).makeJSONSchema(pointer.concat(key), defs, lang),
            ),
            defaut: this.getDefault(),
        };
    }

    @withDefault
    cast(
        value: StringStructure,
        errorKeeper: ErrorKeeper<L>,
        useDefault: boolean,
    ): Result<T, unknown> {
        if (typeof value !== 'object' || Array.isArray(value) || value instanceof File) {
            errorKeeper.push(errorKeeper.formatter.object.type());
            return { ok: false, error: true };
        }
        if (!(this.#key in value)) {
            errorKeeper.push(
                errorKeeper.pointer.concat(this.#key),
                errorKeeper.formatter.object.existField(),
            );
            return { ok: false, error: true };
        }
        const type = (value as Record<string, string>)[this.#key as string];
        if (!(type in this.#groupSchemas)) {
            errorKeeper.push(
                errorKeeper.pointer.concat(this.#key),
                errorKeeper.formatter.object.oneOf(Object.keys(this.#groupSchemas)),
            );
            return { ok: false, error: true };
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (this.#groupSchemas[type as keyof GroupSchemas<T, K, L>] as Schema<any, L>).cast(
            value,
            errorKeeper,
            useDefault,
        );
    }
}
