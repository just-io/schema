import AnySchema from './specific-schemas/any-schema';
import ArraySchema from './specific-schemas/array-schema';
import BooleanSchema from './specific-schemas/boolean-schema';
import ExtendedSchema, { SpecifyingValidator } from './specific-schemas/extended-schema';
import GroupSchema, { GroupSchemas } from './specific-schemas/group-schema';
import NullSchema from './specific-schemas/null-schema';
import NumberSchema from './specific-schemas/number-schema';
import OptionalSchema from './specific-schemas/optional-schema';
import RecordSchema from './specific-schemas/record-schema';
import StringSchema from './specific-schemas/string-schema';
import StructureSchema, { FieldSchemas } from './specific-schemas/structure-schema';
import TupleSchema, { TupleSchemas } from './specific-schemas/tuple-schema';
import UndefinedSchema from './specific-schemas/undefined-schema';
import UnionSchema from './specific-schemas/union-schema';
import UnknownSchema from './specific-schemas/unknown-schema';
import ValueSchema from './specific-schemas/value-schema';
import { Schema } from './schema';
import LazySchema from './specific-schemas/lazy-schema';

export function make<L extends string = 'default'>() {
    return {
        any: () => new AnySchema<L>(),
        unknown: () => new UnknownSchema<L>(),
        value: <T extends string | number | boolean | null>(expectedValue: T) =>
            new ValueSchema<T, L>(expectedValue),
        string: <T extends string>(values: T[] = []) => new StringSchema<T, L>(values),
        number: <T extends number>(values: T[] = []) => new NumberSchema<T, L>(values),
        boolean: () => new BooleanSchema<L>(),
        null: () => new NullSchema<L>(),
        undefined: () => new UndefinedSchema<L>(),
        union: <T>(...unionSchemas: Schema<T, L>[]) => new UnionSchema<T, L>(...unionSchemas),
        optional: <T>(schema: Schema<T, L>) => new OptionalSchema<T, L>(schema),
        group: <T, K extends keyof T & string>(key: K, groupSchemas: GroupSchemas<T, K, L>) =>
            new GroupSchema<T, K, L>(key, groupSchemas),
        extended: <T>(
            mainSchema: Schema<T, L>,
            ...specifyingValidators: SpecifyingValidator<T, L>[]
        ) => new ExtendedSchema<T, L>(mainSchema, ...specifyingValidators),
        array: <T>(itemSchema: Schema<T, L>) => new ArraySchema<T, L>(itemSchema),
        tuple: <T extends unknown[]>(...tupleSchemas: TupleSchemas<T, L>) =>
            new TupleSchema<T, L>(...(tupleSchemas as { [I in keyof T]: Schema<T[I], L> })),
        structure: <T>(fieldSchemas: FieldSchemas<T, L>) => new StructureSchema<T, L>(fieldSchemas),
        record: <T>(valueSchema: Schema<T, L>) => new RecordSchema<T, L>(valueSchema),
        lazy: <T>(lazySchema: () => Schema<T, L>) => new LazySchema<T, L>(lazySchema),
    };
}

export * from './error-keeper';
export * from './pointer';
export * from './error-formatters';
