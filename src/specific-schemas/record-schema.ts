import { ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import {
    TypeSchema,
    Schema,
    Defs,
    Result,
    StringStructure,
    withDefault,
    ResultValue,
} from '../schema';

export default class RecordSchema<T, L extends string> extends TypeSchema<Record<string, T>, L> {
    #valueSchema: Schema<T, L>;

    constructor(valueSchema: Schema<T, L>) {
        super();
        this.#valueSchema = valueSchema;
    }

    @withDefault
    validate(
        value: unknown,
        errorKeeper: ErrorKeeper<L>,
        useDefault: boolean,
    ): Result<Record<string, T>, unknown> {
        if (typeof value !== 'object' || value === null) {
            errorKeeper.push(errorKeeper.formatter.object.type());
            return { ok: false, error: true };
        }
        const entries = Object.entries(value);
        const castedEntries = entries
            .map(
                (entry) =>
                    [
                        entry[0],
                        this.#valueSchema.validate(
                            entry[1],
                            errorKeeper.child(entry[0]),
                            useDefault,
                        ),
                    ] as const,
            )
            .filter((entry): entry is [string, ResultValue<T>] => entry[1].ok)
            .map((entry) => [entry[0], entry[1].value] as const);
        if (castedEntries.length !== entries.length) {
            return { ok: false, error: true };
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
        errorKeeper: ErrorKeeper<L>,
        useDefault: boolean,
    ): Result<Record<string, T>, unknown> {
        if (
            typeof value === 'string' ||
            value === undefined ||
            Array.isArray(value) ||
            value instanceof File
        ) {
            errorKeeper.push(errorKeeper.formatter.object.type());
            return { ok: false, error: true };
        }
        const entries = Object.entries(value);
        const castedEntries = entries
            .map(
                (entry) =>
                    [
                        entry[0],
                        this.#valueSchema.cast(entry[1], errorKeeper.child(entry[0]), useDefault),
                    ] as const,
            )
            .filter((entry): entry is [string, ResultValue<T>] => entry[1].ok)
            .map((entry) => [entry[0], entry[1].value] as const);
        if (castedEntries.length !== entries.length) {
            return { ok: false, error: true };
        }

        return {
            ok: true,
            value: Object.fromEntries(castedEntries),
        };
    }
}
