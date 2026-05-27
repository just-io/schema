import { ErrorFormatter } from '../error-formatter';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { TypeSchema, Schema, Defs, StringStructure, withDefault, ValidationError } from '../schema';
import OptionalSchema from './optional-schema';
import { Result } from '../result';
import { ErrorSet } from '../error-set';

export type FieldSchemas<T> = {
    [K in keyof T]-?: Schema<T[K]>;
};

export default class StructureSchema<T> extends TypeSchema<T> {
    #fieldSchemas: FieldSchemas<T>;

    #additionalProps: false | Schema<unknown> = false;

    constructor(fieldSchemas: FieldSchemas<T>) {
        super();
        this.#fieldSchemas = fieldSchemas;
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

        const castedEntries: [string, T[keyof T]][] = [];
        const keys = Object.keys(this.#fieldSchemas);
        const errorSet = new ErrorSet<ValidationError>();
        for (const key of keys) {
            const result = this.#fieldSchemas[key as keyof FieldSchemas<T>].validate(
                (value as Record<string, ErrorSet<ValidationError>>)[key],
                pointer.concat(key),
                formatter,
                useDefault,
            );
            if (result.ok) {
                castedEntries.push([key, result.value]);
            } else {
                if (!(key in value)) {
                    errorSet.add({
                        pointer: pointer.concat(key),
                        detail: formatter.object.existField(),
                    });
                } else {
                    errorSet.append(result.error);
                }
            }
        }
        for (const key of Object.keys(value)) {
            if (!(key in this.#fieldSchemas)) {
                if (this.#additionalProps) {
                    const result = this.#additionalProps.validate(
                        (value as Record<string, ErrorSet<ValidationError>>)[key],
                        pointer.concat(key),
                        formatter,
                        useDefault,
                    );
                    if (result.ok) {
                        castedEntries.push([key, result.value as T[keyof T]]);
                    } else {
                        errorSet.append(result.error);
                    }
                } else {
                    errorSet.add({
                        pointer: pointer.concat(key),
                        detail: formatter.object.notexistField(),
                    });
                }
            }
        }
        if (errorSet.hasErrors()) {
            return { ok: false, error: errorSet };
        }
        return {
            ok: true,
            value: Object.fromEntries(castedEntries) as T,
        };
    }

    makeJSONSchema(pointer: Pointer, defs: Defs, lang: string): JSONSchemaValue {
        return {
            type: 'object',
            title: this.getTitle(lang),
            description: this.getDescription(lang),
            properties: Object.fromEntries(
                Object.entries(this.#fieldSchemas).map(([key, fieldSchema]) => {
                    return [
                        key,
                        (fieldSchema as Schema<unknown>).makeJSONSchema(
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

        const castedEntries: [string, T[keyof T]][] = [];
        const keys = Object.keys(this.#fieldSchemas);
        const errorSet = new ErrorSet<ValidationError>();
        for (const key of keys) {
            const result = this.#fieldSchemas[key as keyof FieldSchemas<T>].cast(
                value[key],
                pointer.concat(key),
                formatter,
                useDefault,
            );
            if (result.ok) {
                castedEntries.push([key, result.value]);
            } else {
                if (!(key in value)) {
                    errorSet.add({
                        pointer: pointer.concat(key),
                        detail: formatter.object.existField(),
                    });
                } else {
                    errorSet.append(result.error);
                }
            }
        }
        for (const key of Object.keys(value)) {
            if (!(key in this.#fieldSchemas)) {
                if (this.#additionalProps) {
                    const result = this.#additionalProps.cast(
                        value[key],
                        pointer.concat(key),
                        formatter,
                        useDefault,
                    );
                    if (result.ok) {
                        castedEntries.push([key, result.value as T[keyof T]]);
                    } else {
                        errorSet.append(result.error);
                    }
                } else {
                    errorSet.add({
                        pointer: pointer.concat(key),
                        detail: formatter.object.notexistField(),
                    });
                }
            }
        }
        if (errorSet.hasErrors()) {
            return { ok: false, error: errorSet };
        }
        return {
            ok: true,
            value: Object.fromEntries(castedEntries) as T,
        };
    }

    additionalProps(additionalProps: false | Schema<unknown>): this {
        this.#additionalProps = additionalProps;
        return this;
    }
}
