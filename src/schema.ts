import { defaultErrorFormatters } from './error-formatters';
import { DummyErrorKeeper, ErrorKeeper } from './error-keeper';
import { JSONSchemaRoot, JSONSchemaValue } from './json-schema';
import { Pointer } from './pointer';

const dummyJSONSchemaValue: JSONSchemaValue = {};

export class Defs<L extends string> {
    #defs: Map<Schema<unknown, L>, [Pointer, JSONSchemaValue]> = new Map();

    #makeRef(pointer: Pointer): string {
        return `#/$defs${pointer.toString()}`;
    }

    collectSchema(pointer: Pointer, schema: Schema<unknown, L>, lang: L): JSONSchemaValue {
        const def = this.#defs.get(schema);
        if (def) {
            let title: string | undefined;
            let description: string | undefined;
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            if (schema instanceof TypeSchema) {
                title = schema.getTitle(lang);
                description = schema.getDescription(lang);
            }
            return {
                title,
                description,
                $ref: this.#makeRef(def[0]),
            };
        }
        const declaration: [Pointer, JSONSchemaValue] = [pointer, dummyJSONSchemaValue];
        this.#defs.set(schema, declaration);
        const { title, description, ...jsonSchema } = schema.makeJSONSchema(pointer, this, lang);
        declaration[1] = jsonSchema;

        return {
            title,
            description,
            $ref: this.#makeRef(pointer),
        };
    }

    get size(): number {
        return this.#defs.size;
    }

    makeDefs(): Record<string, JSONSchemaValue> {
        return Object.fromEntries(
            Array.from(this.#defs.entries()).map(([, [name, jsonSchema]]) => [
                name.toString('/', ''),
                jsonSchema,
            ]),
        );
    }
}

export abstract class Schema<T, L extends string> {
    /**
     * Type guard for type T
     * @param value incoming value for checking
     * @param lang language for errors
     * @param errorKeeper structure for collecting validation errors
     * @returns true if value has type T otherwise false
     */
    abstract validate(value: unknown, lang: L, errorKeeper: ErrorKeeper<L>): value is T;

    /**
     * Private method for generating JSON Schema
     * @param pointer
     * @param defs
     * @param lang
     */
    abstract makeJSONSchema(pointer: Pointer, defs: Defs<L>, lang: L): JSONSchemaValue;

    /**
     * Type guard for type T but throw error set if value has not type T
     * @param value incoming value for checking
     * @param lang language for errors
     * @param errorKeeper structure for collecting validation errors
     * @returns true if value has type T otherwise false
     */
    check(value: unknown): value is T;
    check(value: unknown, lang: L, errorKeeper: ErrorKeeper<L>): value is T;
    check(value: unknown, lang?: L, errorKeeper?: ErrorKeeper<L>): value is T {
        if (lang && errorKeeper && !this.is(value, lang, errorKeeper)) {
            throw errorKeeper.makeErrorSet();
        }
        if (!this.is(value)) {
            throw new Error('Invalid value');
        }

        return true;
    }

    /**
     * Type guard for type T
     * @param value incoming value for checking
     * @param lang language for errors
     * @param errorKeeper structure for collecting validation errors
     * @returns true if value has type T otherwise false
     */
    is(value: unknown): value is T;
    is(value: unknown, lang: L, errorKeeper: ErrorKeeper<L>): value is T;
    is(value: unknown, lang?: L, errorKeeper?: ErrorKeeper<L>): value is T {
        if (lang && errorKeeper) {
            return this.validate(value, lang, errorKeeper);
        }
        const dummyErrorKeeper = new DummyErrorKeeper<'default'>({
            default: defaultErrorFormatters,
        });
        return this.validate(value, 'default' as L, dummyErrorKeeper as DummyErrorKeeper<L>);
    }

    /**
     * Generate JSON Schema for this schema
     * @param lang language for generating titles and descriptions
     * @returns JSON Schema
     */
    generateJSONSchema(lang: L): JSONSchemaRoot {
        const defs = new Defs<L>();
        const jsonSchemaRoot: JSONSchemaRoot = this.makeJSONSchema(new Pointer(), defs, lang);
        if (defs.size) {
            jsonSchemaRoot.$defs = defs.makeDefs();
        }

        return JSON.parse(JSON.stringify(jsonSchemaRoot));
    }
}

export abstract class TypeSchema<T, L extends string> extends Schema<T, L> {
    #title?: Record<L, string>;

    #description?: Record<L, string>;

    #default?: T | (() => T);

    title(title: Record<L, string>): this {
        this.#title = title;

        return this;
    }

    description(description: Record<L, string>): this {
        this.#description = description;

        return this;
    }

    default(defaultValue: T | (() => T)): this {
        this.#default = defaultValue;

        return this;
    }

    getDescription(lang: L): string | undefined {
        return this.#description?.[lang];
    }

    getTitle(lang: L): string | undefined {
        return this.#title?.[lang];
    }

    getDefault(): T | undefined {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return typeof this.#default === 'function' ? this.#default() : this.#default;
    }
}
