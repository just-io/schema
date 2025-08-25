import { ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { TypeSchema, Schema, Defs } from '../schema';
import OptionalSchema from './optional-schema';

export type FieldSchemas<T, L extends string> = {
    [K in keyof T]-?: Schema<T[K], L>;
};

export default class StructureSchema<T, L extends string> extends TypeSchema<T, L> {
    #fieldSchemas: FieldSchemas<T, L>;

    constructor(fieldSchemas: FieldSchemas<T, L>) {
        super();
        this.#fieldSchemas = fieldSchemas;
    }

    validate(value: unknown, lang: L, errorKeeper: ErrorKeeper<L>): value is T {
        if (typeof value !== 'object' || value === null) {
            errorKeeper.push(errorKeeper.formatters(lang).object.type());
            return false;
        }
        const keys = Object.keys(this.#fieldSchemas);
        let isCorrectedValues = true;
        for (const key of keys) {
            const fieldValue = (value as Record<string, unknown>)[key];
            const innerErrorKeeper = errorKeeper.fork(key);
            if (
                !this.#fieldSchemas[key as keyof FieldSchemas<T, L>].validate(
                    fieldValue,
                    lang,
                    innerErrorKeeper,
                )
            ) {
                if (!(key in value)) {
                    errorKeeper.push(
                        errorKeeper.pointer.concat(key),
                        errorKeeper.formatters(lang).object.existField(),
                    );
                } else {
                    innerErrorKeeper.flush();
                }

                isCorrectedValues = false;
            }
        }

        const valueKeys = Object.keys(value);
        for (const key of valueKeys) {
            if (!(key in this.#fieldSchemas)) {
                errorKeeper.push(
                    errorKeeper.pointer.concat(key),
                    errorKeeper.formatters(lang).object.notexistField(),
                );
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
            properties: Object.fromEntries(
                Object.entries(this.#fieldSchemas).map(([key, fieldSchema]) => {
                    return [
                        key,
                        (fieldSchema as Schema<unknown, L>).makeJSONSchema(
                            pointer.concat(key),
                            defs,
                            lang,
                        ),
                    ];
                }),
            ),
            additionalProperties: false,
            required: Object.entries(this.#fieldSchemas)
                .map(([key, fieldSchema]) => {
                    return fieldSchema instanceof OptionalSchema ? '' : key;
                })
                .filter(Boolean),
            defaut: this.getDefault(),
        };
    }
}
