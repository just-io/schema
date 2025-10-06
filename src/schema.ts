import { defaultErrorFormatters } from './error-formatters';
import { DummyErrorKeeper, ErrorKeeper } from './error-keeper';
import { JSONSchemaRoot, JSONSchemaValue } from './json-schema';
import { Pointer } from './pointer';

const dummyJSONSchemaValue: JSONSchemaValue = {};

export class Defs<L extends string> {
    #defs: Map<Schema<unknown, L>, [Pointer, JSONSchemaValue]> = new Map();

    #makeRef(pointer: Pointer): string {
        return pointer.toString('/', '#', '$defs');
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
                name.toString('/'),
                jsonSchema,
            ]),
        );
    }
}

export type ResultValue<T> = { ok: true; value: T };
export type ResultError<E> = { ok: false; error: E };
export type Result<T, E> = ResultValue<T> | ResultError<E>;

export type StringStructure =
    | undefined
    | string
    | File
    | (string | File)[]
    | {
          [key: string]: StringStructure;
      };

export function withDefault<T, L extends string, V>(
    method: (
        value: V,
        lang: L,
        errorKeeper: ErrorKeeper<L>,
        useDefault: boolean,
    ) => Result<T, unknown>,
) {
    return function (
        this: Schema<T, L>,
        value: V,
        lang: L,
        errorKeeper: ErrorKeeper<L>,
        useDefault: boolean,
    ): Result<T, unknown> {
        if (useDefault) {
            const defValue = this.getDefault();
            if (value === undefined && defValue !== undefined) {
                return { ok: true, value: defValue };
            }
        }

        return method.call(this, value, lang, errorKeeper, useDefault);
    };
}

export abstract class Schema<T, L extends string> {
    /**
     * Validate value for type T and return valid value wrapped in type `Result`
     * @param value incoming value for checking
     * @param lang language for errors
     * @param errorKeeper structure for collecting validation errors
     * @param useDefault use default value if current value queal undefined
     */
    abstract validate(
        value: unknown,
        lang: L,
        errorKeeper: ErrorKeeper<L>,
        useDefault: boolean,
    ): Result<T, unknown>;

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
     */
    assert(value: unknown): value is T;
    assert(value: unknown, lang: L, errorKeeper: ErrorKeeper<L>): value is T;
    assert(value: unknown, lang?: L, errorKeeper?: ErrorKeeper<L>): value is T {
        if (lang && errorKeeper && !this.is(value, lang, errorKeeper)) {
            throw errorKeeper.makeErrorSet();
        }
        if (!this.is(value)) {
            throw new Error('Invalid value');
        }

        return true;
    }

    /**
     * Check value for type T and return valid value wrapped in type `Result`
     * @param value incoming value for checking
     * @param lang language for errors
     * @param errorKeeper structure for collecting validation errors
     */
    check(value: unknown): Result<T, unknown>;
    check(value: unknown, lang: L, errorKeeper: ErrorKeeper<L>): Result<T, unknown>;
    check(value: unknown, lang?: L, errorKeeper?: ErrorKeeper<L>): Result<T, unknown> {
        if (lang && errorKeeper) {
            return this.validate(value, lang, errorKeeper, false);
        }
        const dummyErrorKeeper = new DummyErrorKeeper<'default'>({
            default: defaultErrorFormatters,
        });

        return this.validate(value, 'default' as L, dummyErrorKeeper as DummyErrorKeeper<L>, false);
    }

    /**
     * Type guard for type T returns true if value has type T otherwise false
     * @param value incoming value for checking
     * @param lang language for errors
     * @param errorKeeper structure for collecting validation errors
     */
    is(value: unknown): value is T;
    is(value: unknown, lang: L, errorKeeper: ErrorKeeper<L>): value is T;
    is(value: unknown, lang?: L, errorKeeper?: ErrorKeeper<L>): value is T {
        if (lang && errorKeeper) {
            return this.validate(value, lang, errorKeeper, false).ok;
        }
        const dummyErrorKeeper = new DummyErrorKeeper<'default'>({
            default: defaultErrorFormatters,
        });

        return this.validate(value, 'default' as L, dummyErrorKeeper as DummyErrorKeeper<L>, false)
            .ok;
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

    getDefault(): T | undefined {
        return undefined;
    }

    /**
     * Cast value to type T and returns valid value wrapped in type `Result`
     * @param value incoming value for checking
     * @param lang language for errors
     * @param errorKeeper structure for collecting validation errors
     * @param useDefault use default value if current value queal undefined
     */
    abstract cast(
        value: StringStructure,
        lang: L,
        errorKeeper: ErrorKeeper<L>,
        useDefault: boolean,
    ): Result<T, unknown>;

    #compose(
        entries: [Pointer, string | File][],
        lang: L,
        errorKeeper: ErrorKeeper<L>,
        useDefault: boolean,
    ): Result<T, unknown> {
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
                    errorKeeper.push(entry[0], errorKeeper.formatters(lang).path());
                    return { ok: false, error: true };
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

        return this.cast(value, lang, errorKeeper, useDefault);
    }

    compose(
        source: FormData | URLSearchParams | Record<string, string | string[] | File | File[]>,
        lang: L,
        errorKeeper: ErrorKeeper<L>,
        useDefault: boolean,
        separator = '/',
        rootsCount = 0,
    ): Result<T, unknown> {
        const entries: [Pointer, string | File][] = [];
        if (source instanceof FormData || source instanceof URLSearchParams) {
            source.forEach((value, key) => {
                entries.push([Pointer.fromString(key, separator, rootsCount), value]);
            });
        } else {
            Object.entries(source).forEach(([pointer, value]) => {
                if (Array.isArray(value)) {
                    for (const v of value) {
                        entries.push([Pointer.fromString(pointer, separator, rootsCount), v]);
                    }
                } else {
                    entries.push([Pointer.fromString(pointer, separator, rootsCount), value]);
                }
            });
        }

        return this.#compose(entries, lang, errorKeeper, useDefault);
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
