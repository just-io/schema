import { ErrorFormatter } from '../error-formatter';
import { ErrorKeeper, ValidationError } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { TypeSchema, Schema, Defs, StringStructure, withDefault } from '../schema';
import { Result } from '../result';
import { ErrorSet } from '../error-set';

export default class UnionSchema<T, L extends string> extends TypeSchema<T, L> {
    #schemas: Schema<T, L>[];

    constructor(...schemas: Schema<T, L>[]) {
        super();
        this.#schemas = schemas;
    }

    @withDefault
    validate(
        value: unknown,
        errorKeeper: ErrorKeeper,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<T, ErrorSet<ValidationError>> {
        const innerErrorKeeper = errorKeeper.child();
        for (let i = 0; i < this.#schemas.length; i++) {
            const unionErrorKeeper = innerErrorKeeper.child();
            unionErrorKeeper.group = i;
            const castedValue = this.#schemas[i].validate(
                value,
                unionErrorKeeper,
                formatter,
                useDefault,
            );
            if (castedValue.ok) {
                return castedValue;
            }
            innerErrorKeeper.append(castedValue.error);
        }
        errorKeeper.append(innerErrorKeeper.makeErrorSet());

        return { ok: false, error: errorKeeper.makeErrorSet() };
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
        errorKeeper: ErrorKeeper,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<T, ErrorSet<ValidationError>> {
        const innerErrorKeeper = errorKeeper.child();
        for (let i = 0; i < this.#schemas.length; i++) {
            const unionErrorKeeper = innerErrorKeeper.child();
            unionErrorKeeper.group = i;
            const castedValue = this.#schemas[i].cast(
                value,
                unionErrorKeeper,
                formatter,
                useDefault,
            );
            if (castedValue.ok) {
                return castedValue;
            }
            innerErrorKeeper.append(castedValue.error);
        }
        errorKeeper.append(innerErrorKeeper.makeErrorSet());

        return { ok: false, error: errorKeeper.makeErrorSet() };
    }
}
