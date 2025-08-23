import { ErrorKeeper } from '../error-keeper';
import { JSONSchemaValue } from '../json-schema';
import { Pointer } from '../pointer';
import { Defs, TypeSchema } from '../schema';

export default class ValueSchema<
    T extends string | number | boolean | null,
    L extends string,
> extends TypeSchema<T, L> {
    #expectedValue: T;

    constructor(expectedValue: T) {
        super();
        this.#expectedValue = expectedValue;
    }

    validate(value: unknown, lang: L, errorKeeper: ErrorKeeper<L>): value is T {
        if (value !== this.#expectedValue) {
            errorKeeper.push(errorKeeper.formatters(lang).value(this.#expectedValue));
            return false;
        }

        return true;
    }

    makeJSONSchema(pointer: Pointer, defs: Defs<L>, lang: L): JSONSchemaValue {
        if (typeof this.#expectedValue === 'string') {
            return {
                type: 'string',
                title: this.getTitle(lang),
                description: this.getDescription(lang),
                const: this.#expectedValue,
                defaut: this.getDefault() as string | undefined,
            };
        }
        if (typeof this.#expectedValue === 'number') {
            return {
                type: 'number',
                title: this.getTitle(lang),
                description: this.getDescription(lang),
                const: this.#expectedValue,
                defaut: this.getDefault() as number | undefined,
            };
        }
        if (typeof this.#expectedValue === 'boolean') {
            return {
                type: 'boolean',
                title: this.getTitle(lang),
                description: this.getDescription(lang),
                const: this.#expectedValue,
                defaut: this.getDefault() as boolean | undefined,
            };
        }
        if (this.#expectedValue === null) {
            return {
                type: 'null',
                title: this.getTitle(lang),
                description: this.getDescription(lang),
                const: this.#expectedValue,
                defaut: this.getDefault() as null | undefined,
            };
        }
        return {
            title: this.getTitle(lang),
            description: this.getDescription(lang),
            defaut: this.getDefault(),
        };
    }
}
