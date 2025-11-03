import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { ErrorKeeper, defaultErrorFormatters } from '../index';

import StructureSchema from './structure-schema';
import StringSchema from './string-schema';
import NumberSchema from './number-schema';

describe('StructureSchema', () => {
    describe('method validate', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
            assert.ok(
                new StructureSchema({
                    name: new StringSchema(),
                    count: new NumberSchema(),
                }).validate({ name: 'name', count: 12 }, 'default', errorKeeper, false).ok,
            );
        });

        test('should return value result when value has right type with additional properties', () => {
            const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
            assert.ok(
                new StructureSchema(
                    {
                        name: new StringSchema(),
                        count: new NumberSchema(),
                    },
                    new NumberSchema(),
                ).validate({ name: 'name', count: 12, total: 27 }, 'default', errorKeeper, false)
                    .ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
            assert.ok(
                !new StructureSchema({
                    name: new StringSchema(),
                    count: new NumberSchema(),
                }).validate(null, 'default', errorKeeper, false).ok,
            );
            assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                { pointer: [], details: 'Should be "object" type.' },
            ]);
        });

        test('should return error result when value contains wrong keys and does not contain right keys and has errors', () => {
            const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
            assert.ok(
                !new StructureSchema({
                    name: new StringSchema(),
                    count: new NumberSchema(),
                }).validate({ prefix: 'name', count: '12' }, 'default', errorKeeper, false).ok,
            );
            assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                { pointer: ['name'], details: 'Should be existed.' },
                { pointer: ['count'], details: 'Should be "number" type.' },
                { pointer: ['prefix'], details: 'Should not be existed.' },
            ]);
        });

        test('should return error result when value contains wrong additional properties', () => {
            const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
            assert.ok(
                !new StructureSchema(
                    {
                        name: new StringSchema(),
                        count: new NumberSchema(),
                    },
                    new NumberSchema(),
                ).validate(
                    { name: 'name', count: 12, total: '27 pages' },
                    'default',
                    errorKeeper,
                    false,
                ).ok,
            );
            assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                { pointer: ['total'], details: 'Should be "number" type.' },
            ]);
        });
    });

    describe('method cast', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
            assert.ok(
                new StructureSchema({ name: new StringSchema(), count: new NumberSchema() }).cast(
                    { name: 'name', count: '12' },
                    'default',
                    errorKeeper,
                    false,
                ).ok,
            );
        });

        test('should return value result when value has right type with additional properties', () => {
            const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
            assert.ok(
                new StructureSchema(
                    {
                        name: new StringSchema(),
                        count: new NumberSchema(),
                    },
                    new NumberSchema(),
                ).cast({ name: 'name', count: '12', total: '27' }, 'default', errorKeeper, false)
                    .ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
            assert.ok(
                !new StructureSchema({ name: new StringSchema(), count: new NumberSchema() }).cast(
                    '',
                    'default',
                    errorKeeper,
                    false,
                ).ok,
            );
            assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                { pointer: [], details: 'Should be "object" type.' },
            ]);
        });

        test('should return error result when value contains wrong keys and does not contain right keys and has errors', () => {
            const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
            assert.ok(
                !new StructureSchema({ name: new StringSchema(), count: new NumberSchema() }).cast(
                    { prefix: 'name', count: '' },
                    'default',
                    errorKeeper,
                    false,
                ).ok,
            );
            assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                { pointer: ['name'], details: 'Should be existed.' },
                { pointer: ['count'], details: 'Should be "number" type.' },
                { pointer: ['prefix'], details: 'Should not be existed.' },
            ]);
        });

        test('should return error result when value contains wrong additional properties', () => {
            const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
            assert.ok(
                !new StructureSchema(
                    {
                        name: new StringSchema(),
                        count: new NumberSchema(),
                    },
                    new NumberSchema(),
                ).cast(
                    { name: 'name', count: '12', total: '27 pages' },
                    'default',
                    errorKeeper,
                    false,
                ).ok,
            );
            assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                { pointer: ['total'], details: 'Should be "number" type.' },
            ]);
        });
    });
});
