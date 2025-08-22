import { ErrorKeeper } from './error-keeper';
import { JSONSchemaRoot, JSONSchemaValue } from './json-schema';
import { Pointer } from './pointer';

const dummyJSONSchemaValue: JSONSchemaValue = {};

export class Defs {
    #defs: Map<BaseSchema<unknown>, [Pointer, JSONSchemaValue]> = new Map();

    #makeRef(pointer: Pointer): string {
        return `#/$defs${pointer.toString()}`;
    }

    collectSchema(pointer: Pointer, schema: Schema<unknown>, lang: string): JSONSchemaValue {
        if (typeof schema !== 'function') {
            return schema.makeJSONSchema(pointer, this, lang);
        }
        const baseSchema = schema();

        const def = this.#defs.get(baseSchema);
        if (def) {
            let title: string | undefined;
            let description: string | undefined;
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            if (baseSchema instanceof TypeSchema) {
                title = baseSchema.getTitle(lang);
                description = baseSchema.getDescription(lang);
            }
            return {
                title,
                description,
                $ref: this.#makeRef(def[0]),
            };
        }
        const declaration: [Pointer, JSONSchemaValue] = [pointer, dummyJSONSchemaValue];
        this.#defs.set(baseSchema, declaration);
        const { title, description, ...jsonSchema } = baseSchema.makeJSONSchema(pointer, this, lang);
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
            Array.from(this.#defs.entries()).map(([, [name, jsonSchema]]) => [name.toString('/', ''), jsonSchema])
        );
    }
}

export abstract class BaseSchema<T> {
    /**
     * Type guard for type T
     * @param value incoming value for checking
     * @param errorKeeper structure for collecting validation errors
     * @returns true if value has type T otherwise false
     */
    abstract is(value: unknown, errorKeeper?: ErrorKeeper): value is T;

    /**
     * Private method for generating JSON Schema
     * @param pointer
     * @param defs
     * @param lang
     */
    abstract makeJSONSchema(pointer: Pointer, defs: Defs, lang: string): JSONSchemaValue;

    /**
     * Type guard for type T but throw error set if value has not type T
     * @param value incoming value for checking
     * @param errorKeeper structure for collecting validation errors
     * @returns true if value has type T otherwise false
     */
    check(value: unknown, errorKeeper?: ErrorKeeper): value is T {
        if (!this.is(value, errorKeeper)) {
            throw errorKeeper?.makeErrorSet() ?? new Error('Invalid value');
        }

        return true;
    }

    protected static callValidator<T>(schema: Schema<T>, value: unknown, errorKeeper: ErrorKeeper): value is T {
        if (schema instanceof BaseSchema) {
            return schema.is(value, errorKeeper);
        }
        return schema().is(value, errorKeeper);
    }

    protected static getSchema<T>(schema: Schema<T>): BaseSchema<T> {
        if (schema instanceof BaseSchema) {
            return schema;
        }
        return schema();
    }

    /**
     * Generate JSON Schema for this schema
     * @param lang language for generating titles and descriptions
     * @returns JSON Schema
     */
    generateJSONSchema(lang = 'default'): JSONSchemaRoot {
        const defs = new Defs();
        const jsonSchemaRoot: JSONSchemaRoot = this.makeJSONSchema(new Pointer(), defs, lang);
        if (defs.size) {
            jsonSchemaRoot.$defs = defs.makeDefs();
        }

        return JSON.parse(JSON.stringify(jsonSchemaRoot));
    }
}

type LocalizeString = string | ((lang: string) => string);

export abstract class TypeSchema<T> extends BaseSchema<T> {
    #title?: LocalizeString;

    #description?: LocalizeString;

    #default?: T | (() => T);

    title(title: LocalizeString): this {
        this.#title = title;

        return this;
    }

    description(description: LocalizeString): this {
        this.#description = description;

        return this;
    }

    default(defaultValue: T | (() => T)): this {
        this.#default = defaultValue;

        return this;
    }

    getDescription(lang = 'default'): string | undefined {
        return typeof this.#description === 'function' ? this.#description(lang) : this.#description;
    }

    getTitle(lang = 'default'): string | undefined {
        return typeof this.#title === 'function' ? this.#title(lang) : this.#title;
    }

    getDefault(): T | undefined {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return typeof this.#default === 'function' ? this.#default() : this.#default;
    }
}

type LazySchema<T> = () => BaseSchema<T>;
export type Schema<T> = BaseSchema<T> | LazySchema<T>;
