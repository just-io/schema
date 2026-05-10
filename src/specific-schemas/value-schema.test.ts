import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { ErrorKeeper, defaultErrorFormatter } from '../index';

import ValueSchema from './value-schema';
import { transformToJSON } from '../heplers';

describe('ValueSchema', () => {
    describe('method validate', () => {
        describe('for string value', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper();
                assert.ok(
                    new ValueSchema('str').validate(
                        'str',
                        errorKeeper,
                        defaultErrorFormatter,
                        false,
                    ).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper();
                const result = new ValueSchema('str').validate(
                    12,
                    errorKeeper,
                    defaultErrorFormatter,
                    false,
                );
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    { pointer: [], detail: 'Should be equal "str".' },
                ]);
            });
        });

        describe('for number value', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper();
                assert.ok(
                    new ValueSchema(12).validate(12, errorKeeper, defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper();
                const result = new ValueSchema(12).validate(
                    'str',
                    errorKeeper,
                    defaultErrorFormatter,
                    false,
                );
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    { pointer: [], detail: 'Should be equal "12".' },
                ]);
            });
        });

        describe('for boolean value', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper();
                assert.ok(
                    new ValueSchema(true).validate(true, errorKeeper, defaultErrorFormatter, false)
                        .ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper();
                const result = new ValueSchema(true).validate(
                    'str',
                    errorKeeper,
                    defaultErrorFormatter,
                    false,
                );
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    { pointer: [], detail: 'Should be equal "true".' },
                ]);
            });
        });

        describe('for null value', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper();
                assert.ok(
                    new ValueSchema(null).validate(null, errorKeeper, defaultErrorFormatter, false)
                        .ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper();
                const result = new ValueSchema(null).validate(
                    'str',
                    errorKeeper,
                    defaultErrorFormatter,
                    false,
                );
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    { pointer: [], detail: 'Should be equal "null".' },
                ]);
            });
        });
    });

    describe('method cast', () => {
        describe('for string value', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper();
                assert.ok(
                    new ValueSchema('str').cast('str', errorKeeper, defaultErrorFormatter, false)
                        .ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper();
                const result = new ValueSchema('str').cast(
                    '12',
                    errorKeeper,
                    defaultErrorFormatter,
                    false,
                );
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    { pointer: [], detail: 'Should be equal "str".' },
                ]);
            });
        });

        describe('for number value', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper();
                assert.ok(
                    new ValueSchema(12).cast('12', errorKeeper, defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper();
                const result = new ValueSchema(12).cast(
                    'str',
                    errorKeeper,
                    defaultErrorFormatter,
                    false,
                );
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    { pointer: [], detail: 'Should be equal "12".' },
                ]);
            });
        });

        describe('for boolean value', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper();
                assert.ok(
                    new ValueSchema(true).cast('true', errorKeeper, defaultErrorFormatter, false)
                        .ok,
                );
                assert.ok(
                    new ValueSchema(false).cast('', errorKeeper, defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper();
                const result = new ValueSchema(true).cast(
                    '',
                    errorKeeper,
                    defaultErrorFormatter,
                    false,
                );
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    { pointer: [], detail: 'Should contain more than or equal 1 symbols.' },
                ]);
            });
        });

        describe('for null value', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper();
                assert.ok(
                    new ValueSchema(null).cast('', errorKeeper, defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper();
                const result = new ValueSchema(null).cast(
                    'null',
                    errorKeeper,
                    defaultErrorFormatter,
                    false,
                );
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    { pointer: [], detail: 'Should contain less than or equal 0 symbols.' },
                ]);
            });
        });
    });
});
