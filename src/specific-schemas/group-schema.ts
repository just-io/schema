import { ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { TypeSchema, Schema, Defs } from '../schema';

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

    validate(value: unknown, lang: L, errorKeeper: ErrorKeeper<L>): value is T {
        if (typeof value !== 'object' || value === null) {
            errorKeeper.push(errorKeeper.formatters(lang).object.type());
            return false;
        }
        if (!(this.#key in value)) {
            errorKeeper.push(
                errorKeeper.pointer.concat(this.#key),
                errorKeeper.formatters(lang).object.existField(),
            );
            return false;
        }
        const type = (value as Record<string, string>)[this.#key as string];
        if (!(type in this.#groupSchemas)) {
            errorKeeper.push(
                errorKeeper.pointer.concat(this.#key),
                errorKeeper.formatters(lang).object.oneOf(Object.keys(this.#groupSchemas)),
            );
            return false;
        }
        if (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (this.#groupSchemas[type as keyof GroupSchemas<T, K, L>] as Schema<any, L>).validate(
                value,
                lang,
                errorKeeper,
            )
        ) {
            return true;
        }

        return false;
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
}
