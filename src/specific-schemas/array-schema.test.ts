import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { ErrorKeeper, defaultErrorFormatter } from '../index';

import ArraySchema from './array-schema';
import NumberSchema from './number-schema';
import { transformToJSON } from '../heplers';

describe('ArraySchema', () => {
    describe('method validate', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper();
            assert.ok(
                new ArraySchema(new NumberSchema()).validate(
                    [1, 2, 3],
                    errorKeeper,
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper();
            const result = new ArraySchema(new NumberSchema()).validate(
                null,
                errorKeeper,
                defaultErrorFormatter,
                false,
            );
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: [], detail: 'Should be "array" type.' },
            ]);
        });

        test('should return error result when item has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper();
            const result = new ArraySchema(new NumberSchema()).validate(
                [1, 'name'],
                errorKeeper,
                defaultErrorFormatter,
                false,
            );
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: ['1'], detail: 'Should be "number" type.' },
            ]);
        });

        describe('with max items', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper();
                assert.ok(
                    new ArraySchema(new NumberSchema())
                        .maxItems(3)
                        .validate([1, 2, 3], errorKeeper, defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper();
                const result = new ArraySchema(new NumberSchema())
                    .maxItems(3)
                    .validate([1, 2, 3, 4], errorKeeper, defaultErrorFormatter, false);
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    { pointer: [], detail: 'Should contain less than or equal 3 items.' },
                ]);
            });
        });

        describe('with min items', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper();
                assert.ok(
                    new ArraySchema(new NumberSchema())
                        .minItems(3)
                        .validate([1, 2, 3], errorKeeper, defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper();
                const result = new ArraySchema(new NumberSchema())
                    .minItems(3)
                    .validate([1, 2], errorKeeper, defaultErrorFormatter, false);
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    { pointer: [], detail: 'Should contain more than or equal 3 items.' },
                ]);
            });
        });

        describe('with unique', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper();
                assert.ok(
                    new ArraySchema(new NumberSchema())
                        .unique()
                        .validate([1, 2, 3], errorKeeper, defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper();
                const result = new ArraySchema(new NumberSchema())
                    .unique()
                    .validate([1, 2, 3, 1], errorKeeper, defaultErrorFormatter, false);
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    { pointer: [], detail: 'All items should be unique.' },
                ]);
            });
        });
    });

    describe('method cast', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper();
            assert.ok(
                new ArraySchema(new NumberSchema()).cast(
                    ['1', '2', '3'],
                    errorKeeper,
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper();
            const result = new ArraySchema(new NumberSchema()).cast(
                undefined,
                errorKeeper,
                defaultErrorFormatter,
                false,
            );
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: [], detail: 'Should be "array" type.' },
            ]);
        });

        test('should return error result when item has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper();
            const result = new ArraySchema(new NumberSchema()).cast(
                ['1', 'name'],
                errorKeeper,
                defaultErrorFormatter,
                false,
            );
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: ['1'], detail: 'Should be "number" type.' },
            ]);
        });

        describe('with max items', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper();
                assert.ok(
                    new ArraySchema(new NumberSchema())
                        .maxItems(3)
                        .cast(['1', '2', '3'], errorKeeper, defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper();
                const result = new ArraySchema(new NumberSchema())
                    .maxItems(3)
                    .cast(['1', '2', '3', '4'], errorKeeper, defaultErrorFormatter, false);
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    { pointer: [], detail: 'Should contain less than or equal 3 items.' },
                ]);
            });
        });

        describe('with min items', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper();
                assert.ok(
                    new ArraySchema(new NumberSchema())
                        .minItems(3)
                        .cast(['1', '2', '3'], errorKeeper, defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper();
                const result = new ArraySchema(new NumberSchema())
                    .minItems(3)
                    .cast(['1', '2'], errorKeeper, defaultErrorFormatter, false);
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    { pointer: [], detail: 'Should contain more than or equal 3 items.' },
                ]);
            });
        });

        describe('with unique', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper();
                assert.ok(
                    new ArraySchema(new NumberSchema())
                        .unique()
                        .cast(['1', '2', '3'], errorKeeper, defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper();
                const result = new ArraySchema(new NumberSchema())
                    .unique()
                    .cast(['1', '2', '3', '1'], errorKeeper, defaultErrorFormatter, false);
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    { pointer: [], detail: 'All items should be unique.' },
                ]);
            });
        });
    });
});
