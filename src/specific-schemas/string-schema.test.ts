import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import StringSchema from './string-schema';
import { transformToJSON } from '../heplers';
import { Pointer } from '../pointer';
import { defaultErrorFormatter } from '../error-formatter';

describe('StringSchema', () => {
    describe('method validate', () => {
        test('should return value result when value has right type', () => {
            assert.ok(
                new StringSchema().validate('string', new Pointer(), defaultErrorFormatter, false)
                    .ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const result = new StringSchema().validate(
                12,
                new Pointer(),
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
                assert.ok(
                    new StringSchema()
                        .regexp(/string/)
                        .validate('string', new Pointer(), defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const result = new StringSchema()
                    .regexp(/string/)
                    .validate('strung', new Pointer(), defaultErrorFormatter, false);
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    { pointer: [], detail: 'Should match regexp "string".' },
                ]);
            });
        });

        describe('with enum', () => {
            test('should return value result when value has right type', () => {
                assert.ok(
                    new StringSchema()
                        .enum(['string', 'str'])
                        .validate('string', new Pointer(), defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const result = new StringSchema()
                    .enum(['string', 'str'])
                    .validate('strung', new Pointer(), defaultErrorFormatter, false);
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
                assert.ok(
                    new StringSchema()
                        .maxLength(2)
                        .validate('st', new Pointer(), defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const result = new StringSchema()
                    .maxLength(2)
                    .validate('str', new Pointer(), defaultErrorFormatter, false);
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    { pointer: [], detail: 'Should contain less than or equal 2 symbols.' },
                ]);
            });
        });

        describe('with min length', () => {
            test('should return value result when value has right type', () => {
                assert.ok(
                    new StringSchema()
                        .minLength(2)
                        .validate('st', new Pointer(), defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const result = new StringSchema()
                    .minLength(2)
                    .validate('s', new Pointer(), defaultErrorFormatter, false);
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    { pointer: [], detail: 'Should contain more than or equal 2 symbols.' },
                ]);
            });
        });
    });

    describe('method cast', () => {
        test('should return value result when value has right type', () => {
            assert.ok(
                new StringSchema().cast('string', new Pointer(), defaultErrorFormatter, false).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const result = new StringSchema().cast({}, new Pointer(), defaultErrorFormatter, false);
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: [], detail: 'Should be "string" type.' },
            ]);
        });

        describe('with regexp', () => {
            test('should return value result when value has right type', () => {
                assert.ok(
                    new StringSchema()
                        .regexp(/string/)
                        .cast('string', new Pointer(), defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const result = new StringSchema()
                    .regexp(/string/)
                    .cast('strung', new Pointer(), defaultErrorFormatter, false);
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    { pointer: [], detail: 'Should match regexp "string".' },
                ]);
            });
        });

        describe('with enum', () => {
            test('should return value result when value has right type', () => {
                assert.ok(
                    new StringSchema()
                        .enum(['string', 'str'])
                        .cast('string', new Pointer(), defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const result = new StringSchema()
                    .enum(['string', 'str'])
                    .cast('strung', new Pointer(), defaultErrorFormatter, false);
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
                assert.ok(
                    new StringSchema()
                        .maxLength(2)
                        .cast('st', new Pointer(), defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const result = new StringSchema()
                    .maxLength(2)
                    .cast('str', new Pointer(), defaultErrorFormatter, false);
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    { pointer: [], detail: 'Should contain less than or equal 2 symbols.' },
                ]);
            });
        });

        describe('with min length', () => {
            test('should return value result when value has right type', () => {
                assert.ok(
                    new StringSchema()
                        .minLength(2)
                        .cast('st', new Pointer(), defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const result = new StringSchema()
                    .minLength(2)
                    .cast('s', new Pointer(), defaultErrorFormatter, false);
                assert.ok(!result.ok);
                assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                    { pointer: [], detail: 'Should contain more than or equal 2 symbols.' },
                ]);
            });
        });
    });
});
