import { ErrorFormatter } from '../error-formatter';
import { ErrorKeeper, ValidationError } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { TypeSchema, Schema, Defs, StringStructure, withDefault } from '../schema';
import { Result } from '../result';
import { ErrorSet } from '../error-set';

export default class RecordSchema<T, L extends string> extends TypeSchema<Record<string, T>, L> {
    #valueSchema: Schema<T, L>;

    constructor(valueSchema: Schema<T, L>) {
        super();
        this.#valueSchema = valueSchema;
    }

    @withDefault
    validate(
        value: unknown,
        errorKeeper: ErrorKeeper,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<Record<string, T>, ErrorSet<ValidationError>> {
        if (typeof value !== 'object' || value === null) {
            errorKeeper.push({ detail: formatter.object.type() });
            return { ok: false, error: errorKeeper.makeErrorSet() };
        }
        const castedEntries: [string, T][] = [];
        const entries = Object.entries(value);
        for (const entry of entries) {
            const result = this.#valueSchema.validate(
                entry[1],
                errorKeeper.child(entry[0]),
                formatter,
                useDefault,
            );
            if (result.ok) {
                castedEntries.push([entry[0], result.value]);
            } else {
                errorKeeper.append(result.error);
            }
        }
        if (errorKeeper.hasErrors()) {
            return { ok: false, error: errorKeeper.makeErrorSet() };
        }
        return {
            ok: true,
            value: Object.fromEntries(castedEntries),
        };
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

    @withDefault
    cast(
        value: StringStructure,
        errorKeeper: ErrorKeeper,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<Record<string, T>, ErrorSet<ValidationError>> {
        if (
            typeof value === 'string' ||
            value === undefined ||
            Array.isArray(value) ||
            value instanceof File
        ) {
            errorKeeper.push({ detail: formatter.object.type() });
            return { ok: false, error: errorKeeper.makeErrorSet() };
        }
        const castedEntries: [string, T][] = [];
        const entries = Object.entries(value);
        for (const entry of entries) {
            const result = this.#valueSchema.cast(
                entry[1],
                errorKeeper.child(entry[0]),
                formatter,
                useDefault,
            );
            if (result.ok) {
                castedEntries.push([entry[0], result.value]);
            } else {
                errorKeeper.append(result.error);
            }
        }
        if (errorKeeper.hasErrors()) {
            return { ok: false, error: errorKeeper.makeErrorSet() };
        }
        return {
            ok: true,
            value: Object.fromEntries(castedEntries),
        };
    }
}
