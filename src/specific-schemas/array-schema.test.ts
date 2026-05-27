import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import ArraySchema from './array-schema';
import NumberSchema from './number-schema';
import { transformToJSON } from '../heplers';
import { Pointer } from '../pointer';
import { defaultErrorFormatter } from '../error-formatter';

describe('ArraySchema', () => {
    describe('method validate', () => {
        test('should return value result when value has right type', () => {
            assert.ok(
                new ArraySchema(new NumberSchema()).validate(
                    [1, 2, 3],
                    new Pointer(),
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const result = new ArraySchema(new NumberSchema()).validate(
                null,
                new Pointer(),
                defaultErrorFormatter,
                false,
            );
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: [], detail: 'Should be "array" type.' },
            ]);
        });

        test('should return error result when item has not right type and has errors', () => {
            const result = new ArraySchema(new NumberSchema()).validate(
                [1, 'name'],
                new Pointer(),
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
                assert.ok(
                    new ArraySchema(new NumberSchema())
                        .maxItems(3)
                        .validate([1, 2, 3], new Pointer(), defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const result = new ArraySchema(new NumberSchema())
                    .maxItems(3)
                    .validate([1, 2, 3, 4], new Pointer(), defaultErrorFormatter, false);
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    { pointer: [], detail: 'Should contain less than or equal 3 items.' },
                ]);
            });
        });

        describe('with min items', () => {
            test('should return value result when value has right type', () => {
                assert.ok(
                    new ArraySchema(new NumberSchema())
                        .minItems(3)
                        .validate([1, 2, 3], new Pointer(), defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const result = new ArraySchema(new NumberSchema())
                    .minItems(3)
                    .validate([1, 2], new Pointer(), defaultErrorFormatter, false);
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    { pointer: [], detail: 'Should contain more than or equal 3 items.' },
                ]);
            });
        });

        describe('with unique', () => {
            test('should return value result when value has right type', () => {
                assert.ok(
                    new ArraySchema(new NumberSchema())
                        .unique()
                        .validate([1, 2, 3], new Pointer(), defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const result = new ArraySchema(new NumberSchema())
                    .unique()
                    .validate([1, 2, 3, 1], new Pointer(), defaultErrorFormatter, false);
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    { pointer: [], detail: 'All items should be unique.' },
                ]);
            });
        });
    });

    describe('method cast', () => {
        test('should return value result when value has right type', () => {
            assert.ok(
                new ArraySchema(new NumberSchema()).cast(
                    ['1', '2', '3'],
                    new Pointer(),
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const result = new ArraySchema(new NumberSchema()).cast(
                undefined,
                new Pointer(),
                defaultErrorFormatter,
                false,
            );
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: [], detail: 'Should be "array" type.' },
            ]);
        });

        test('should return error result when item has not right type and has errors', () => {
            const result = new ArraySchema(new NumberSchema()).cast(
                ['1', 'name'],
                new Pointer(),
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
                assert.ok(
                    new ArraySchema(new NumberSchema())
                        .maxItems(3)
                        .cast(['1', '2', '3'], new Pointer(), defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const result = new ArraySchema(new NumberSchema())
                    .maxItems(3)
                    .cast(['1', '2', '3', '4'], new Pointer(), defaultErrorFormatter, false);
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    { pointer: [], detail: 'Should contain less than or equal 3 items.' },
                ]);
            });
        });

        describe('with min items', () => {
            test('should return value result when value has right type', () => {
                assert.ok(
                    new ArraySchema(new NumberSchema())
                        .minItems(3)
                        .cast(['1', '2', '3'], new Pointer(), defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const result = new ArraySchema(new NumberSchema())
                    .minItems(3)
                    .cast(['1', '2'], new Pointer(), defaultErrorFormatter, false);
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    { pointer: [], detail: 'Should contain more than or equal 3 items.' },
                ]);
            });
        });

        describe('with unique', () => {
            test('should return value result when value has right type', () => {
                assert.ok(
                    new ArraySchema(new NumberSchema())
                        .unique()
                        .cast(['1', '2', '3'], new Pointer(), defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const result = new ArraySchema(new NumberSchema())
                    .unique()
                    .cast(['1', '2', '3', '1'], new Pointer(), defaultErrorFormatter, false);
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    { pointer: [], detail: 'All items should be unique.' },
                ]);
            });
        });
    });
});
