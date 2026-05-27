import { ErrorFormatter } from '../error-formatter';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { TypeSchema, Schema, Defs, StringStructure, withDefault, ValidationError } from '../schema';
import { Result } from '../result';
import { ErrorSet } from '../error-set';

export default class UnionSchema<T> extends TypeSchema<T> {
    #schemas: Schema<T>[];

    constructor(...schemas: Schema<T>[]) {
        super();
        this.#schemas = schemas;
    }

    @withDefault
    validate(
        value: unknown,
        pointer: Pointer,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<T, ErrorSet<ValidationError>> {
        const errorSet = new ErrorSet<ValidationError>();
        for (let i = 0; i < this.#schemas.length; i++) {
            const castedValue = this.#schemas[i].validate(value, pointer, formatter, useDefault);
            if (castedValue.ok) {
                return castedValue;
            }
            for (const error of castedValue.error.errors) {
                errorSet.add({
                    pointer: error.pointer,
                    detail: error.detail,
                    group: error.group ?? i,
                });
            }
        }

        return { ok: false, error: errorSet };
    }

    makeJSONSchema(pointer: Pointer, defs: Defs, lang: string): JSONSchemaValue {
        return {
            title: this.getTitle(lang),
            description: this.getDescription(lang),
            oneOf: this.#schemas.map((schema, i) =>
                schema.makeJSONSchema(pointer.concat(i), defs, lang),
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
        const errorSet = new ErrorSet<ValidationError>();
        for (let i = 0; i < this.#schemas.length; i++) {
            const castedValue = this.#schemas[i].cast(value, pointer, formatter, useDefault);
            if (castedValue.ok) {
                return castedValue;
            }
            for (const error of castedValue.error.errors) {
                errorSet.add({
                    pointer: error.pointer,
                    detail: error.detail,
                    group: error.group ?? i,
                });
            }
        }

        return { ok: false, error: errorSet };
    }
}
