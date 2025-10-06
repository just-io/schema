import { ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import {
    TypeSchema,
    Schema,
    Defs,
    StringStructure,
    Result,
    withDefault,
    ResultValue,
} from '../schema';
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

    @withDefault
    validate(
        value: unknown,
        lang: L,
        errorKeeper: ErrorKeeper<L>,
        useDefault: boolean,
    ): Result<T, unknown> {
        if (typeof value !== 'object' || value === null) {
            errorKeeper.push(errorKeeper.formatters(lang).object.type());
            return { ok: false, error: true };
        }

        const keys = Object.keys(this.#fieldSchemas);
        const castedEntries = keys
            .map((key) => {
                const innerErrorKeeper = errorKeeper.fork(key);
                const result = this.#fieldSchemas[key as keyof FieldSchemas<T, L>].validate(
                    (value as Record<string, unknown>)[key],
                    lang,
                    innerErrorKeeper,
                    useDefault,
                );

                if (!result.ok) {
                    if (!(key in value)) {
                        errorKeeper.push(
                            errorKeeper.pointer.concat(key),
                            errorKeeper.formatters(lang).object.existField(),
                        );
                        return [key, { ok: false, error: true }] as const;
                    } else {
                        innerErrorKeeper.flush();
                    }
                }
                return [key, result] as const;
            })
            .filter((entry): entry is [string, ResultValue<T[keyof T]>] => entry[1].ok)
            .map((entry) => [entry[0], entry[1].value] as const);

        let isCorrectedValues = true;
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

        if (castedEntries.length !== keys.length || !isCorrectedValues) {
            return { ok: false, error: true };
        }

        return {
            ok: true,
            value: Object.fromEntries(castedEntries) as T,
        };
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

    @withDefault
    cast(
        value: StringStructure,
        lang: L,
        errorKeeper: ErrorKeeper<L>,
        useDefault: boolean,
    ): Result<T, unknown> {
        if (typeof value !== 'object' || Array.isArray(value) || value instanceof File) {
            errorKeeper.push(errorKeeper.formatters(lang).object.type());
            return { ok: false, error: true };
        }

        const keys = Object.keys(this.#fieldSchemas);
        const castedEntries = keys
            .map((key) => {
                const innerErrorKeeper = errorKeeper.fork(key);
                const result = this.#fieldSchemas[key as keyof FieldSchemas<T, L>].cast(
                    value[key],
                    lang,
                    innerErrorKeeper,
                    useDefault,
                );

                if (!(key in value)) {
                    errorKeeper.push(
                        errorKeeper.pointer.concat(key),
                        errorKeeper.formatters(lang).object.existField(),
                    );
                    return [key, { ok: false, error: true }] as const;
                } else {
                    innerErrorKeeper.flush();
                    return [key, result] as const;
                }
            })
            .filter((entry): entry is [string, ResultValue<T[keyof T]>] => entry[1].ok)
            .map((entry) => [entry[0], entry[1].value] as const);

        let isCorrectedValues = true;
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

        if (castedEntries.length !== keys.length || !isCorrectedValues) {
            return { ok: false, error: true };
        }

        return {
            ok: true,
            value: Object.fromEntries(castedEntries) as T,
        };
    }
}
