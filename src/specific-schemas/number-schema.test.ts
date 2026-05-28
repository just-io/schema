import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import NumberSchema from './number-schema';
import { transformToJSON } from '../helpers';
import { Pointer } from '../pointer';
import { defaultErrorFormatter } from '../error-formatter';

describe('NumberSchema', () => {
    describe('method validate', () => {
        test('should return value result when value has right type', () => {
            assert.ok(
                new NumberSchema().validate(1234, new Pointer(), defaultErrorFormatter, false).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const result = new NumberSchema().validate(
                '1234',
                new Pointer(),
                defaultErrorFormatter,
                false,
            );
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: [], detail: 'Should be "number" type.' },
            ]);
        });

        describe('with enum', () => {
            test('should return value result when value has right type', () => {
                assert.ok(
                    new NumberSchema()
                        .enum([1, 2, 3])
                        .validate(1, new Pointer(), defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const result = new NumberSchema()
                    .enum([1, 2, 3])
                    .validate(0, new Pointer(), defaultErrorFormatter, false);
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    { pointer: [], detail: 'Should be included in enum of values: 1, 2, 3.' },
                ]);
            });
        });

        describe('with maximum', () => {
            test('should return value result when value has right type', () => {
                assert.ok(
                    new NumberSchema()
                        .maximum(2)
                        .validate(2, new Pointer(), defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const result = new NumberSchema()
                    .maximum(2)
                    .validate(3, new Pointer(), defaultErrorFormatter, false);
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    { pointer: [], detail: 'Should be less than or equal 2.' },
                ]);
            });
        });

        describe('with minimum', () => {
            test('should return value result when value has right type', () => {
                assert.ok(
                    new NumberSchema()
                        .minimum(2)
                        .validate(2, new Pointer(), defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const result = new NumberSchema()
                    .minimum(2)
                    .validate(1, new Pointer(), defaultErrorFormatter, false);
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    { pointer: [], detail: 'Should be more than or equal 2.' },
                ]);
            });
        });

        describe('with integer', () => {
            test('should return value result when value has right type', () => {
                assert.ok(
                    new NumberSchema()
                        .integer()
                        .validate(2, new Pointer(), defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const result = new NumberSchema()
                    .integer()
                    .validate(3.1, new Pointer(), defaultErrorFormatter, false);
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    { pointer: [], detail: 'Should be integer value.' },
                ]);
            });
        });
    });

    describe('method cast', () => {
        test('should return value result when value has right type', () => {
            assert.ok(
                new NumberSchema().cast('1234', new Pointer(), defaultErrorFormatter, false).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const result = new NumberSchema().cast(
                'str',
                new Pointer(),
                defaultErrorFormatter,
                false,
            );
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: [], detail: 'Should be "number" type.' },
            ]);
        });

        describe('with enum', () => {
            test('should return value result when value has right type', () => {
                assert.ok(
                    new NumberSchema()
                        .enum([1, 2, 3])
                        .cast('1', new Pointer(), defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const result = new NumberSchema()
                    .enum([1, 2, 3])
                    .cast('0', new Pointer(), defaultErrorFormatter, false);
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    { pointer: [], detail: 'Should be included in enum of values: 1, 2, 3.' },
                ]);
            });
        });

        describe('with maximum', () => {
            test('should return value result when value has right type', () => {
                assert.ok(
                    new NumberSchema()
                        .maximum(2)
                        .cast('2', new Pointer(), defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const result = new NumberSchema()
                    .maximum(2)
                    .cast('3', new Pointer(), defaultErrorFormatter, false);
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    { pointer: [], detail: 'Should be less than or equal 2.' },
                ]);
            });
        });

        describe('with minimum', () => {
            test('should return value result when value has right type', () => {
                assert.ok(
                    new NumberSchema()
                        .minimum(2)
                        .cast('2', new Pointer(), defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const result = new NumberSchema()
                    .minimum(2)
                    .cast('1', new Pointer(), defaultErrorFormatter, false);
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    { pointer: [], detail: 'Should be more than or equal 2.' },
                ]);
            });
        });

        describe('with integer', () => {
            test('should return value result when value has right type', () => {
                assert.ok(
                    new NumberSchema()
                        .integer()
                        .cast('2', new Pointer(), defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const result = new NumberSchema()
                    .integer()
                    .cast('3.1', new Pointer(), defaultErrorFormatter, false);
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    { pointer: [], detail: 'Should be integer value.' },
                ]);
            });
        });
    });
});
