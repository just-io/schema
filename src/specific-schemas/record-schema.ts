import { dummyErrorKeeper, ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { TypeSchema, Schema, Defs } from '../schema';

export default class RecordSchema<T> extends TypeSchema<Record<string, T>> {
    #valueSchema: Schema<T>;

    constructor(valueSchema: Schema<T>) {
        super();
        this.#valueSchema = valueSchema;
    }

    is(value: unknown, errorKeeper: ErrorKeeper = dummyErrorKeeper): value is Record<string, T> {
        if (typeof value !== 'object' || value === null) {
            errorKeeper.push(errorKeeper.formatters.object.type());
            return false;
        }
        const valueKeys = Object.keys(value);
        let isCorrectedValues = true;
        for (const key of valueKeys) {
            if (
                !TypeSchema.callValidator(
                    this.#valueSchema,
                    (value as Record<string, unknown>)[key],
                    errorKeeper.child(key)
                )
            ) {
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
            additionalProperties: defs.collectSchema(pointer, this.#valueSchema, lang),
            defaut: this.getDefault(),
        };
    }
}
