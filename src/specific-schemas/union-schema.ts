import { ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { TypeSchema, Schema, Defs, Result, StringStructure, withDefault } from '../schema';

export default class UnionSchema<T, L extends string> extends TypeSchema<T, L> {
    #schemas: Schema<T, L>[];

    constructor(...schemas: Schema<T, L>[]) {
        super();
        this.#schemas = schemas;
    }

    @withDefault
    validate(
        value: unknown,
        lang: L,
        errorKeeper: ErrorKeeper<L>,
        useDefault: boolean,
    ): Result<T, unknown> {
        const innerErrorKeeper = errorKeeper.fork();
        for (let i = 0; i < this.#schemas.length; i++) {
            const unionErrorKeeper = innerErrorKeeper.fork();
            unionErrorKeeper.group = i;
            const castedValue = this.#schemas[i].validate(
                value,
                lang,
                unionErrorKeeper,
                useDefault,
            );
            if (castedValue.ok) {
                return castedValue;
            }
            unionErrorKeeper.flush();
        }
        innerErrorKeeper.flush();

        return { ok: false, error: true };
    }

    makeJSONSchema(pointer: Pointer, defs: Defs<L>, lang: L): JSONSchemaValue {
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
        lang: L,
        errorKeeper: ErrorKeeper<L>,
        useDefault: boolean,
    ): Result<T, unknown> {
        const innerErrorKeeper = errorKeeper.fork();
        for (let i = 0; i < this.#schemas.length; i++) {
            const unionErrorKeeper = innerErrorKeeper.fork();
            unionErrorKeeper.group = i;
            const castedValue = this.#schemas[i].cast(value, lang, unionErrorKeeper, useDefault);
            if (castedValue.ok) {
                return castedValue;
            }
            unionErrorKeeper.flush();
        }
        innerErrorKeeper.flush();

        return { ok: false, error: true };
    }
}
