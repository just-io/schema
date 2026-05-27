import { defaultErrorFormatter, ErrorFormatter } from './error-formatter';
import { ErrorSet } from './error-set';
import { JSONSchemaRoot, JSONSchemaValue } from './json-schema';
import { Pointer } from './pointer';
import { Result } from './result';

const dummyJSONSchemaValue: JSONSchemaValue = {};

export type ValidationError = {
    pointer: Pointer;
    detail: string;
    group?: number;
};

export class Defs {
    #defs: Map<Schema<unknown>, [Pointer, JSONSchemaValue]> = new Map();

    #makeRef(pointer: Pointer): string {
        return pointer.toString('/', '#', '$defs');
    }

    collectSchema(pointer: Pointer, schema: Schema<unknown>, lang: string): JSONSchemaValue {
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
                name.toString('/'),
                jsonSchema,
            ]),
        );
    }
}

export type StringStructure =
    | undefined
    | string
    | File
    | (string | File)[]
    | {
          [key: string]: StringStructure;
      };

export function withDefault<T, V>(
    method: (
        value: V,
        pointer: Pointer,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ) => Result<T, ErrorSet<ValidationError>>,
) {
    return function (
        this: Schema<T>,
        value: V,
        pointer: Pointer,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<T, ErrorSet<ValidationError>> {
        if (useDefault) {
            const defValue = this.getDefault();
            if (value === undefined && defValue !== undefined) {
                return { ok: true, value: defValue };
            }
        }

        return method.call(this, value, pointer, formatter, useDefault);
    };
}

export abstract class Schema<T> {
    /**
     * Validate value for type T and return valid value wrapped in type `Result`
     * @param value incoming value for checking
     * @param pointer pointer for current value
     * @param formatter object containing function for format errors
     * @param useDefault use default value if current value queal undefined
     */
    abstract validate(
        value: unknown,
        pointer: Pointer,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<T, ErrorSet<ValidationError>>;

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
     * @param pointer pointer for current value
     * @param formatter object containing function for format errors
     */
    assert(value: unknown): value is T;
    assert(value: unknown, pointer: Pointer, formatter: ErrorFormatter): value is T;
    assert(value: unknown, pointer?: Pointer, formatter?: ErrorFormatter): value is T {
        const result =
            pointer && formatter
                ? this.validate(value, pointer, formatter, false)
                : this.validate(value, new Pointer(), defaultErrorFormatter, false);
        if (!result.ok) {
            throw result.error;
        }

        return true;
    }

    /**
     * Check value for type T and return valid value wrapped in type `Result`
     * @param value incoming value for checking
     * @param pointer pointer for current value
     * @param formatter object containing function for format errors
     */
    check(value: unknown): Result<T, ErrorSet<ValidationError>>;
    check(
        value: unknown,
        pointer: Pointer,
        formatter: ErrorFormatter,
    ): Result<T, ErrorSet<ValidationError>>;
    check(
        value: unknown,
        pointer?: Pointer,
        formatter?: ErrorFormatter,
    ): Result<T, ErrorSet<ValidationError>> {
        if (pointer && formatter) {
            return this.validate(value, pointer, formatter, false);
        }

        return this.validate(value, new Pointer(), defaultErrorFormatter, false);
    }

    /**
     * Type guard for type T returns true if value has type T otherwise false
     * @param value incoming value for checking
     * @param pointer pointer for current value
     * @param formatter object containing function for format errors
     */
    is(value: unknown): value is T;
    is(value: unknown, pointer: Pointer, formatter: ErrorFormatter): value is T;
    is(value: unknown, pointer?: Pointer, formatter?: ErrorFormatter): value is T {
        if (pointer && formatter) {
            return this.validate(value, pointer, formatter, false).ok;
        }

        return this.validate(value, new Pointer(), defaultErrorFormatter, false).ok;
    }

    /**
     * Generate JSON Schema for this schema
     * @param lang language for generating titles and descriptions
     * @returns JSON Schema
     */
    generateJSONSchema(lang: string): JSONSchemaRoot {
        const defs = new Defs();
        const jsonSchemaRoot: JSONSchemaRoot = this.makeJSONSchema(new Pointer(), defs, lang);
        if (defs.size) {
            jsonSchemaRoot.$defs = defs.makeDefs();
        }

        return JSON.parse(JSON.stringify(jsonSchemaRoot));
    }

    getDefault(): T | undefined {
        return undefined;
    }

    /**
     * Cast value to type T and returns valid value wrapped in type `Result`
     * @param value incoming value for checking
     * @param pointer pointer for current value
     * @param formatter object containing function for format errors
     * @param useDefault use default value if current value queal undefined
     */
    abstract cast(
        value: StringStructure,
        pointer: Pointer,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<T, ErrorSet<ValidationError>>;

    #compose(
        entries: [Pointer, string | File][],
        pointer: Pointer,
        formatter: ErrorFormatter,
        useDefault: boolean,
    ): Result<T, ErrorSet<ValidationError>> {
        const value: StringStructure = {};
        for (const entry of entries) {
            let current: StringStructure = value;
            const paths = entry[0].raw();
            for (let i = 0; i < paths.length; i++) {
                if (
                    typeof current !== 'object' ||
                    Array.isArray(current) ||
                    current instanceof File
                ) {
                    return {
                        ok: false,
                        error: new ErrorSet<ValidationError>().add({
                            pointer: pointer.append(entry[0]),
                            detail: formatter.path(),
                        }),
                    };
                }
                if (i === paths.length - 1) {
                    if (Array.isArray(current[paths[i]])) {
                        (current[paths[i]] as (string | File)[]).push(entry[1]);
                    } else if (current[paths[i]] !== undefined) {
                        current[paths[i]] = [current[paths[i]] as string | File, entry[1]];
                    } else {
                        current[paths[i]] = entry[1];
                    }
                } else {
                    if (current[paths[i]] === undefined) {
                        current[paths[i]] = {};
                    }
                    current = current[paths[i]];
                }
            }
        }

        return this.cast(value, pointer, formatter, useDefault);
    }

    compose(
        source: FormData | URLSearchParams | Record<string, string | string[] | File | File[]>,
        pointer: Pointer,
        formatter: ErrorFormatter,
        useDefault: boolean,
        separator = '/',
        rootsCount = 0,
    ): Result<T, ErrorSet<ValidationError>> {
        const entries: [Pointer, string | File][] = [];
        if (source instanceof FormData || source instanceof URLSearchParams) {
            source.forEach((value, key) => {
                entries.push([Pointer.fromString(key, separator, rootsCount), value]);
            });
        } else {
            Object.entries(source).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    for (const v of value) {
                        entries.push([Pointer.fromString(key, separator, rootsCount), v]);
                    }
                } else {
                    entries.push([Pointer.fromString(key, separator, rootsCount), value]);
                }
            });
        }

        return this.#compose(entries, pointer, formatter, useDefault);
    }
}

export abstract class TypeSchema<T> extends Schema<T> {
    #title?: Record<string, string>;

    #description?: Record<string, string>;

    #default?: T | (() => T);

    title(title: Record<string, string>): this {
        this.#title = title;

        return this;
    }

    description(description: Record<string, string>): this {
        this.#description = description;

        return this;
    }

    default(defaultValue: T | (() => T)): this {
        this.#default = defaultValue;

        return this;
    }

    getDescription(lang: string): string | undefined {
        return this.#description?.[lang];
    }

    getTitle(lang: string): string | undefined {
        return this.#title?.[lang];
    }

    getDefault(): T | undefined {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return typeof this.#default === 'function' ? this.#default() : this.#default;
    }
}
