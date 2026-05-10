import { ErrorFormatter } from '../error-formatter';
import { ErrorKeeper, ValidationError } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { TypeSchema, Schema, Defs, StringStructure, withDefault } from '../schema';
import { Result } from '../result';
import { ErrorSet } from '../error-set';

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
    validate(
        value: unknown,
        errorKeeper: ErrorKeeper,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<T, ErrorSet<ValidationError>> {
        if (typeof value !== 'object' || value === null) {
            errorKeeper.push({ detail: formatter.object.type() });
            return { ok: false, error: errorKeeper.makeErrorSet() };
        }
        if (!(this.#key in value)) {
            errorKeeper.push({
                pointer: errorKeeper.pointer.concat(this.#key),
                detail: formatter.object.existField(),
            });
            return { ok: false, error: errorKeeper.makeErrorSet() };
        }
        const type = (value as Record<string, string>)[this.#key as string];
        if (!(type in this.#groupSchemas)) {
            errorKeeper.push({
                pointer: errorKeeper.pointer.concat(this.#key),
                detail: formatter.object.oneOf(Object.keys(this.#groupSchemas)),
            });
            return { ok: false, error: errorKeeper.makeErrorSet() };
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (this.#groupSchemas[type as keyof GroupSchemas<T, K, L>] as Schema<any, L>).validate(
            value,
            errorKeeper,
            formatter,
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
        errorKeeper: ErrorKeeper,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<T, ErrorSet<ValidationError>> {
        if (typeof value !== 'object' || Array.isArray(value) || value instanceof File) {
            errorKeeper.push({ detail: formatter.object.type() });
            return { ok: false, error: errorKeeper.makeErrorSet() };
        }
        if (!(this.#key in value)) {
            errorKeeper.push({
                pointer: errorKeeper.pointer.concat(this.#key),
                detail: formatter.object.existField(),
            });
            return { ok: false, error: errorKeeper.makeErrorSet() };
        }
        const type = (value as Record<string, string>)[this.#key as string];
        if (!(type in this.#groupSchemas)) {
            errorKeeper.push({
                pointer: errorKeeper.pointer.concat(this.#key),
                detail: formatter.object.oneOf(Object.keys(this.#groupSchemas)),
            });
            return { ok: false, error: errorKeeper.makeErrorSet() };
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (this.#groupSchemas[type as keyof GroupSchemas<T, K, L>] as Schema<any, L>).cast(
            value,
            errorKeeper,
            formatter,
            useDefault,
        );
    }
}
