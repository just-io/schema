import { ErrorFormatter } from '../error-formatter';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { TypeSchema, Schema, Defs, StringStructure, withDefault, ValidationError } from '../schema';
import { Result } from '../result';
import { ErrorSet } from '../error-set';

export default class RecordSchema<T> extends TypeSchema<Record<string, T>> {
    #valueSchema: Schema<T>;

    constructor(valueSchema: Schema<T>) {
        super();
        this.#valueSchema = valueSchema;
    }

    @withDefault
    validate(
        value: unknown,
        pointer: Pointer,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<Record<string, T>, ErrorSet<ValidationError>> {
        if (typeof value !== 'object' || value === null) {
            return {
                ok: false,
                error: new ErrorSet<ValidationError>().add({
                    pointer,
                    detail: formatter.object.type(),
                }),
            };
        }
        const castedEntries: [string, T][] = [];
        const entries = Object.entries(value);
        const errorSet = new ErrorSet<ValidationError>();
        for (const entry of entries) {
            const result = this.#valueSchema.validate(
                entry[1],
                pointer.concat(entry[0]),
                formatter,
                useDefault,
            );
            if (result.ok) {
                castedEntries.push([entry[0], result.value]);
            } else {
                errorSet.append(result.error);
            }
        }
        if (errorSet.hasErrors()) {
            return { ok: false, error: errorSet };
        }
        return {
            ok: true,
            value: Object.fromEntries(castedEntries),
        };
    }

    makeJSONSchema(pointer: Pointer, defs: Defs, lang: string): JSONSchemaValue {
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

    @withDefault
    cast(
        value: StringStructure,
        pointer: Pointer,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<Record<string, T>, ErrorSet<ValidationError>> {
        if (
            typeof value === 'string' ||
            value === undefined ||
            Array.isArray(value) ||
            value instanceof File
        ) {
            return {
                ok: false,
                error: new ErrorSet<ValidationError>().add({
                    pointer,
                    detail: formatter.object.type(),
                }),
            };
        }
        const castedEntries: [string, T][] = [];
        const entries = Object.entries(value);
        const errorSet = new ErrorSet<ValidationError>();
        for (const entry of entries) {
            const result = this.#valueSchema.cast(
                entry[1],
                pointer.concat(entry[0]),
                formatter,
                useDefault,
            );
            if (result.ok) {
                castedEntries.push([entry[0], result.value]);
            } else {
                errorSet.append(result.error);
            }
        }
        if (errorSet.hasErrors()) {
            return { ok: false, error: errorSet };
        }
        return {
            ok: true,
            value: Object.fromEntries(castedEntries),
        };
    }
}
