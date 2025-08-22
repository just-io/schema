import { dummyErrorKeeper, ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { TypeSchema, Schema, Defs } from '../schema';

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

    is(value: unknown, errorKeeper: ErrorKeeper = dummyErrorKeeper): value is T {
        if (typeof value !== 'object' || value === null) {
            errorKeeper.push(errorKeeper.formatters.object.type());
            return false;
        }
        if (!(this.#key in value)) {
            errorKeeper.push(errorKeeper.pointer.concat(this.#key), errorKeeper.formatters.object.existField());
            return false;
        }
        const type = (value as Record<string, string>)[this.#key as string];
        if (!(type in this.#groupSchemas)) {
            errorKeeper.push(
                errorKeeper.pointer.concat(this.#key),
                errorKeeper.formatters.object.oneOf(Object.keys(this.#groupSchemas))
            );
            return false;
        }
        if (
            TypeSchema.callValidator(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                this.#groupSchemas[type as keyof GroupSchemas<T, K>] as Schema<any>,
                value,
                errorKeeper
            )
        ) {
            return true;
        }

        return false;
    }

    makeJSONSchema(pointer: Pointer, defs: Defs, lang: string): JSONSchemaValue {
        return {
            title: this.getTitle(),
            description: this.getDescription(),
            oneOf: Object.entries(this.#groupSchemas).map(([key, schema]) =>
                defs.collectSchema(pointer.concat(key), schema as Schema<unknown>, lang)
            ),
            defaut: this.getDefault(),
        };
    }
}
