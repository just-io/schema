import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { ErrorKeeper, defaultErrorFormatter } from '../index';

import StructureSchema from './structure-schema';
import StringSchema from './string-schema';
import NumberSchema from './number-schema';
import OptionalSchema from './optional-schema';
import { transformToJSON } from '../heplers';

describe('StructureSchema', () => {
    describe('method validate', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper();
            assert.ok(
                new StructureSchema({
                    name: new StringSchema(),
                    count: new NumberSchema(),
                }).validate({ name: 'name', count: 12 }, errorKeeper, defaultErrorFormatter, false)
                    .ok,
            );
        });

        test('should return value result when value has right type with additional properties', () => {
            const errorKeeper = new ErrorKeeper();
            assert.ok(
                new StructureSchema({
                    name: new StringSchema(),
                    count: new NumberSchema(),
                })
                    .additionalProps(new NumberSchema())
                    .validate(
                        { name: 'name', count: 12, total: 27 },
                        errorKeeper,
                        defaultErrorFormatter,
                        false,
                    ).ok,
            );
        });

        test('should return value result when value has right type with optional properties', () => {
            const errorKeeper = new ErrorKeeper();
            assert.ok(
                new StructureSchema({
                    name: new StringSchema(),
                    count: new OptionalSchema(new NumberSchema()),
                }).validate({ name: 'name' }, errorKeeper, defaultErrorFormatter, false).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper();
            const result = new StructureSchema({
                name: new StringSchema(),
                count: new NumberSchema(),
            }).validate(null, errorKeeper, defaultErrorFormatter, false);
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: [], detail: 'Should be "object" type.' },
            ]);
        });

        test('should return error result when value contains wrong keys and does not contain right keys and has errors', () => {
            const errorKeeper = new ErrorKeeper();
            const result = new StructureSchema({
                name: new StringSchema(),
                count: new NumberSchema(),
            }).validate({ prefix: 'name', count: '12' }, errorKeeper, defaultErrorFormatter, false);
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: ['name'], detail: 'Should be existed.' },
                { pointer: ['count'], detail: 'Should be "number" type.' },
                { pointer: ['prefix'], detail: 'Should not be existed.' },
            ]);
        });

        test('should return error result when value contains wrong additional properties', () => {
            const errorKeeper = new ErrorKeeper();
            const result = new StructureSchema({
                name: new StringSchema(),
                count: new NumberSchema(),
            })
                .additionalProps(new NumberSchema())
                .validate(
                    { name: 'name', count: 12, total: '27 pages' },
                    errorKeeper,
                    defaultErrorFormatter,
                    false,
                );
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: ['total'], detail: 'Should be "number" type.' },
            ]);
        });
    });

    describe('method cast', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper();
            assert.ok(
                new StructureSchema({ name: new StringSchema(), count: new NumberSchema() }).cast(
                    { name: 'name', count: '12' },
                    errorKeeper,
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
        });

        test('should return value result when value has right type with additional properties', () => {
            const errorKeeper = new ErrorKeeper();
            assert.ok(
                new StructureSchema({
                    name: new StringSchema(),
                    count: new NumberSchema(),
                })
                    .additionalProps(new NumberSchema())
                    .cast(
                        { name: 'name', count: '12', total: '27' },
                        errorKeeper,
                        defaultErrorFormatter,
                        false,
                    ).ok,
            );
        });

        test('should return value result when value has right type with optional properties', () => {
            const errorKeeper = new ErrorKeeper();
            assert.ok(
                new StructureSchema({
                    name: new StringSchema(),
                    count: new OptionalSchema(new NumberSchema()),
                }).cast({ name: 'name' }, errorKeeper, defaultErrorFormatter, false).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper();
            const result = new StructureSchema({
                name: new StringSchema(),
                count: new NumberSchema(),
            }).cast('', errorKeeper, defaultErrorFormatter, false);
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: [], detail: 'Should be "object" type.' },
            ]);
        });

        test('should return error result when value contains wrong keys and does not contain right keys and has errors', () => {
            const errorKeeper = new ErrorKeeper();
            const result = new StructureSchema({
                name: new StringSchema(),
                count: new NumberSchema(),
            }).cast({ prefix: 'name', count: '' }, errorKeeper, defaultErrorFormatter, false);
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: ['name'], detail: 'Should be existed.' },
                { pointer: ['count'], detail: 'Should be "number" type.' },
                { pointer: ['prefix'], detail: 'Should not be existed.' },
            ]);
        });

        test('should return error result when value contains wrong additional properties', () => {
            const errorKeeper = new ErrorKeeper();
            const result = new StructureSchema({
                name: new StringSchema(),
                count: new NumberSchema(),
            })
                .additionalProps(new NumberSchema())
                .cast(
                    { name: 'name', count: '12', total: '27 pages' },
                    errorKeeper,
                    defaultErrorFormatter,
                    false,
                );
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: ['total'], detail: 'Should be "number" type.' },
            ]);
        });
    });
});
