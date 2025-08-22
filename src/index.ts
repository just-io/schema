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

export const schemas = {
    any: () => new AnySchema(),
    unknown: () => new UnknownSchema(),
    value: <T extends string | number | boolean | null>(expectedValue: T) => new ValueSchema(expectedValue),
    string: <T extends string>(values: T[] = []) => new StringSchema<T>(values),
    number: <T extends number>(values: T[] = []) => new NumberSchema<T>(values),
    boolean: () => new BooleanSchema(),
    null: () => new NullSchema(),
    undefined: () => new UndefinedSchema(),
    union: <T>(...unionSchemas: Schema<T>[]) => new UnionSchema(...unionSchemas),
    optional: <T>(schema: Schema<T>) => new OptionalSchema(schema),
    group: <T, K extends keyof T & string>(key: K, groupSchemas: GroupSchemas<T, K>) =>
        new GroupSchema(key, groupSchemas),
    extended: <T>(mainSchema: Schema<T>, ...specifyingValidators: SpecifyingValidator<T>[]) =>
        new ExtendedSchema(mainSchema, ...specifyingValidators),
    array: <T>(itemSchema: Schema<T>) => new ArraySchema(itemSchema),
    tuple: <T extends unknown[]>(...tupleSchemas: TupleSchemas<T>) => new TupleSchema(...tupleSchemas),
    structure: <T>(fieldSchemas: FieldSchemas<T>) => new StructureSchema(fieldSchemas),
    record: <T>(valueSchema: Schema<T>) => new RecordSchema(valueSchema),
};

export * from './error-keeper';
export * from './pointer';
