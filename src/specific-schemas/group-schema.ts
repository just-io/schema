import { ErrorFormatter } from '../error-formatter';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { TypeSchema, Schema, Defs, StringStructure, withDefault, ValidationError } from '../schema';
import { Result } from '../result';
import { ErrorSet } from '../error-set';

export type GroupSchemas<T, K extends keyof T & string> = T[K] extends string
    ? {
          [F in T[K]]: T extends { [IK in K]: F } ? Schema<T> : never;
      }
    : never;

export default class GroupSchema<T, K extends keyof T & string> extends TypeSchema<T> {
    #key: string;

    #groupSchemas: GroupSchemas<T, K>;

    constructor(key: K, groupSchemas: GroupSchemas<T, K>) {
        super();
        this.#key = key;
        this.#groupSchemas = groupSchemas;
    }

    @withDefault
    validate(
        value: unknown,
        pointer: Pointer,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<T, ErrorSet<ValidationError>> {
        if (typeof value !== 'object' || value === null) {
            return {
                ok: false,
                error: new ErrorSet<ValidationError>().add({
                    pointer,
                    detail: formatter.object.type(),
                }),
            };
        }
        if (!(this.#key in value)) {
            return {
                ok: false,
                error: new ErrorSet<ValidationError>().add({
                    pointer: pointer.concat(this.#key),
                    detail: formatter.object.existField(),
                }),
            };
        }
        const type = (value as Record<string, string>)[this.#key as string];
        if (!(type in this.#groupSchemas)) {
            return {
                ok: false,
                error: new ErrorSet<ValidationError>().add({
                    pointer: pointer.concat(this.#key),
                    detail: formatter.object.oneOf(Object.keys(this.#groupSchemas)),
                }),
            };
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (this.#groupSchemas[type as keyof GroupSchemas<T, K>] as Schema<any>).validate(
            value,
            pointer,
            formatter,
            useDefault,
        );
    }

    makeJSONSchema(pointer: Pointer, defs: Defs, lang: string): JSONSchemaValue {
        return {
            title: this.getTitle(lang),
            description: this.getDescription(lang),
            oneOf: Object.entries(this.#groupSchemas).map(([key, schema]) =>
                (schema as Schema<unknown>).makeJSONSchema(pointer.concat(key), defs, lang),
            ),
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
        if (typeof value !== 'object' || Array.isArray(value) || value instanceof File) {
            return {
                ok: false,
                error: new ErrorSet<ValidationError>().add({
                    pointer,
                    detail: formatter.object.type(),
                }),
            };
        }
        if (!(this.#key in value)) {
            return {
                ok: false,
                error: new ErrorSet<ValidationError>().add({
                    pointer: pointer.concat(this.#key),
                    detail: formatter.object.existField(),
                }),
            };
        }
        const type = (value as Record<string, string>)[this.#key as string];
        if (!(type in this.#groupSchemas)) {
            return {
                ok: false,
                error: new ErrorSet<ValidationError>().add({
                    pointer: pointer.concat(this.#key),
                    detail: formatter.object.oneOf(Object.keys(this.#groupSchemas)),
                }),
            };
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (this.#groupSchemas[type as keyof GroupSchemas<T, K>] as Schema<any>).cast(
            value,
            pointer,
            formatter,
            useDefault,
        );
    }
}
