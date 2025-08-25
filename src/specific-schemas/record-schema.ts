import { ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { TypeSchema, Schema, Defs } from '../schema';

export default class RecordSchema<T, L extends string> extends TypeSchema<Record<string, T>, L> {
    #valueSchema: Schema<T, L>;

    constructor(valueSchema: Schema<T, L>) {
        super();
        this.#valueSchema = valueSchema;
    }

    validate(value: unknown, lang: L, errorKeeper: ErrorKeeper<L>): value is Record<string, T> {
        if (typeof value !== 'object' || value === null) {
            errorKeeper.push(errorKeeper.formatters(lang).object.type());
            return false;
        }
        const valueKeys = Object.keys(value);
        let isCorrectedValues = true;
        for (const key of valueKeys) {
            if (
                !this.#valueSchema.validate(
                    (value as Record<string, unknown>)[key],
                    lang,
                    errorKeeper.child(key),
                )
            ) {
                isCorrectedValues = false;
            }
        }

        return isCorrectedValues;
    }

    makeJSONSchema(pointer: Pointer, defs: Defs<L>, lang: L): JSONSchemaValue {
        return {
            type: 'object',
            title: this.getTitle(lang),
            description: this.getDescription(lang),
            additionalProperties: this.#valueSchema.makeJSONSchema(
                pointer.concat('value'),
                defs,
                lang,
            ),
            defaut: this.getDefault(),
        };
    }
}
