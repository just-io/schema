import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { ErrorKeeper, defaultErrorFormatter } from '../index';

import StringSchema from './string-schema';
import { transformToJSON } from '../heplers';

describe('StringSchema', () => {
    describe('method validate', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper();
            assert.ok(
                new StringSchema().validate('string', errorKeeper, defaultErrorFormatter, false).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper();
            const result = new StringSchema().validate(
                12,
                errorKeeper,
                defaultErrorFormatter,
                false,
            );
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: [], detail: 'Should be "string" type.' },
            ]);
        });

        describe('with regexp', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper();
                assert.ok(
                    new StringSchema()
                        .regexp(/string/)
                        .validate('string', errorKeeper, defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper();
                const result = new StringSchema()
                    .regexp(/string/)
                    .validate('strung', errorKeeper, defaultErrorFormatter, false);
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    { pointer: [], detail: 'Should match regexp "string".' },
                ]);
            });
        });

        describe('with enum', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper();
                assert.ok(
                    new StringSchema()
                        .enum(['string', 'str'])
                        .validate('string', errorKeeper, defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper();
                const result = new StringSchema()
                    .enum(['string', 'str'])
                    .validate('strung', errorKeeper, defaultErrorFormatter, false);
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    {
                        pointer: [],
                        detail: 'Should be included in enum of values: "string", "str".',
                    },
                ]);
            });
        });

        describe('with max length', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper();
                assert.ok(
                    new StringSchema()
                        .maxLength(2)
                        .validate('st', errorKeeper, defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper();
                const result = new StringSchema()
                    .maxLength(2)
                    .validate('str', errorKeeper, defaultErrorFormatter, false);
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    { pointer: [], detail: 'Should contain less than or equal 2 symbols.' },
                ]);
            });
        });

        describe('with min length', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper();
                assert.ok(
                    new StringSchema()
                        .minLength(2)
                        .validate('st', errorKeeper, defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper();
                const result = new StringSchema()
                    .minLength(2)
                    .validate('s', errorKeeper, defaultErrorFormatter, false);
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    { pointer: [], detail: 'Should contain more than or equal 2 symbols.' },
                ]);
            });
        });
    });

    describe('method cast', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper();
            assert.ok(
                new StringSchema().cast('string', errorKeeper, defaultErrorFormatter, false).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper();
            const result = new StringSchema().cast({}, errorKeeper, defaultErrorFormatter, false);
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: [], detail: 'Should be "string" type.' },
            ]);
        });

        describe('with regexp', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper();
                assert.ok(
                    new StringSchema()
                        .regexp(/string/)
                        .cast('string', errorKeeper, defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper();
                const result = new StringSchema()
                    .regexp(/string/)
                    .cast('strung', errorKeeper, defaultErrorFormatter, false);
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    { pointer: [], detail: 'Should match regexp "string".' },
                ]);
            });
        });

        describe('with enum', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper();
                assert.ok(
                    new StringSchema()
                        .enum(['string', 'str'])
                        .cast('string', errorKeeper, defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper();
                const result = new StringSchema()
                    .enum(['string', 'str'])
                    .cast('strung', errorKeeper, defaultErrorFormatter, false);
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    {
                        pointer: [],
                        detail: 'Should be included in enum of values: "string", "str".',
                    },
                ]);
            });
        });

        describe('with max length', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper();
                assert.ok(
                    new StringSchema()
                        .maxLength(2)
                        .cast('st', errorKeeper, defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper();
                const result = new StringSchema()
                    .maxLength(2)
                    .cast('str', errorKeeper, defaultErrorFormatter, false);
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    { pointer: [], detail: 'Should contain less than or equal 2 symbols.' },
                ]);
            });
        });

        describe('with min length', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper();
                assert.ok(
                    new StringSchema()
                        .minLength(2)
                        .cast('st', errorKeeper, defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper();
                const result = new StringSchema()
                    .minLength(2)
                    .cast('s', errorKeeper, defaultErrorFormatter, false);
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    { pointer: [], detail: 'Should contain more than or equal 2 symbols.' },
                ]);
            });
        });
    });
});
