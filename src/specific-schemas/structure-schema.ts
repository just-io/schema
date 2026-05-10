import { ErrorFormatter } from '../error-formatter';
import { ErrorKeeper, ValidationError } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { TypeSchema, Schema, Defs, StringStructure, withDefault } from '../schema';
import OptionalSchema from './optional-schema';
import { Result } from '../result';
import { ErrorSet } from '../error-set';

export type FieldSchemas<T, L extends string> = {
    [K in keyof T]-?: Schema<T[K], L>;
};

export default class StructureSchema<T, L extends string> extends TypeSchema<T, L> {
    #fieldSchemas: FieldSchemas<T, L>;

    #additionalProps: false | Schema<unknown, L> = false;

    constructor(fieldSchemas: FieldSchemas<T, L>) {
        super();
        this.#fieldSchemas = fieldSchemas;
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

        const castedEntries: [string, T[keyof T]][] = [];
        const keys = Object.keys(this.#fieldSchemas);
        for (const key of keys) {
            const result = this.#fieldSchemas[key as keyof FieldSchemas<T, L>].validate(
                (value as Record<string, ErrorSet<ValidationError>>)[key],
                errorKeeper.child(key),
                formatter,
                useDefault,
            );
            if (result.ok) {
                castedEntries.push([key, result.value]);
            } else {
                if (!(key in value)) {
                    errorKeeper.push({
                        pointer: errorKeeper.pointer.concat(key),
                        detail: formatter.object.existField(),
                    });
                } else {
                    errorKeeper.append(result.error);
                }
            }
        }
        for (const key of Object.keys(value)) {
            if (!(key in this.#fieldSchemas)) {
                if (this.#additionalProps) {
                    const result = this.#additionalProps.validate(
                        (value as Record<string, ErrorSet<ValidationError>>)[key],
                        errorKeeper.child(key),
                        formatter,
                        useDefault,
                    );
                    if (result.ok) {
                        castedEntries.push([key, result.value as T[keyof T]]);
                    } else {
                        errorKeeper.append(result.error);
                    }
                } else {
                    errorKeeper.push({
                        pointer: errorKeeper.pointer.concat(key),
                        detail: formatter.object.notexistField(),
                    });
                }
            }
        }
        if (errorKeeper.hasErrors()) {
            return { ok: false, error: errorKeeper.makeErrorSet() };
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
            additionalProperties: this.#additionalProps
                ? this.#additionalProps.makeJSONSchema(pointer.concat('property'), defs, lang)
                : false,
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
        errorKeeper: ErrorKeeper,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<T, ErrorSet<ValidationError>> {
        if (typeof value !== 'object' || Array.isArray(value) || value instanceof File) {
            errorKeeper.push({ detail: formatter.object.type() });
            return { ok: false, error: errorKeeper.makeErrorSet() };
        }

        const castedEntries: [string, T[keyof T]][] = [];
        const keys = Object.keys(this.#fieldSchemas);
        for (const key of keys) {
            const result = this.#fieldSchemas[key as keyof FieldSchemas<T, L>].cast(
                value[key],
                errorKeeper.child(key),
                formatter,
                useDefault,
            );
            if (result.ok) {
                castedEntries.push([key, result.value]);
            } else {
                if (!(key in value)) {
                    errorKeeper.push({
                        pointer: errorKeeper.pointer.concat(key),
                        detail: formatter.object.existField(),
                    });
                } else {
                    errorKeeper.append(result.error);
                }
            }
        }
        for (const key of Object.keys(value)) {
            if (!(key in this.#fieldSchemas)) {
                if (this.#additionalProps) {
                    const result = this.#additionalProps.cast(
                        value[key],
                        errorKeeper.child(key),
                        formatter,
                        useDefault,
                    );
                    if (result.ok) {
                        castedEntries.push([key, result.value as T[keyof T]]);
                    } else {
                        errorKeeper.append(result.error);
                    }
                } else {
                    errorKeeper.push({
                        pointer: errorKeeper.pointer.concat(key),
                        detail: formatter.object.notexistField(),
                    });
                }
            }
        }
        if (errorKeeper.hasErrors()) {
            return { ok: false, error: errorKeeper.makeErrorSet() };
        }
        return {
            ok: true,
            value: Object.fromEntries(castedEntries) as T,
        };
    }

    additionalProps(additionalProps: false | Schema<unknown, L>): this {
        this.#additionalProps = additionalProps;
        return this;
    }
}
