import { dummyErrorKeeper, ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { TypeSchema, Schema, Defs } from '../schema';
import OptionalSchema from './optional-schema';

export type FieldSchemas<T> = {
    [K in keyof T]-?: Schema<T[K]>;
};

export default class StructureSchema<T> extends TypeSchema<T> {
    #fieldSchemas: FieldSchemas<T>;

    constructor(fieldSchemas: FieldSchemas<T>) {
        super();
        this.#fieldSchemas = fieldSchemas;
    }

    is(value: unknown, errorKeeper: ErrorKeeper = dummyErrorKeeper): value is T {
        if (typeof value !== 'object' || value === null) {
            errorKeeper.push(errorKeeper.formatters.object.type());
            return false;
        }
        const keys = Object.keys(this.#fieldSchemas);
        let isCorrectedValues = true;
        for (const key of keys) {
            const fieldValue = (value as Record<string, unknown>)[key];
            const innerErrorKeeper = errorKeeper.fork(key);
            if (
                !TypeSchema.callValidator(
                    this.#fieldSchemas[key as keyof FieldSchemas<T>],
                    fieldValue,
                    innerErrorKeeper
                )
            ) {
                if (!(key in value)) {
                    errorKeeper.push(errorKeeper.pointer.concat(key), errorKeeper.formatters.object.existField());
                } else {
                    innerErrorKeeper.flush();
                }

                isCorrectedValues = false;
            }
        }

        const valueKeys = Object.keys(value);
        for (const key of valueKeys) {
            if (!(key in this.#fieldSchemas)) {
                errorKeeper.push(errorKeeper.pointer.concat(key), errorKeeper.formatters.object.notexistField());
                isCorrectedValues = false;
            }
        }

        return isCorrectedValues;
    }

    makeJSONSchema(pointer: Pointer, defs: Defs, lang: string): JSONSchemaValue {
        return {
            type: 'object',
            title: this.getTitle(),
            description: this.getDescription(),
            properties: Object.fromEntries(
                Object.entries(this.#fieldSchemas).map(([key, fieldSchema]) => {
                    return [key, defs.collectSchema(pointer.concat(key), fieldSchema as Schema<unknown>, lang)];
                })
            ),
            additionalProperties: false,
            required: Object.entries(this.#fieldSchemas)
                .map(([key, fieldSchema]) => {
                    return TypeSchema.getSchema(fieldSchema as Schema<unknown>) instanceof OptionalSchema ? '' : key;
                })
                .filter(Boolean),
            defaut: this.getDefault(),
        };
    }
}
