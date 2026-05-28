import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import ValueSchema from './value-schema';
import { transformToJSON } from '../helpers';
import { Pointer } from '../pointer';
import { defaultErrorFormatter } from '../error-formatter';

describe('ValueSchema', () => {
    describe('method validate', () => {
        describe('for string value', () => {
            test('should return value result when value has right type', () => {
                assert.ok(
                    new ValueSchema('str').validate(
                        'str',
                        new Pointer(),
                        defaultErrorFormatter,
                        false,
                    ).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const result = new ValueSchema('str').validate(
                    12,
                    new Pointer(),
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
                assert.ok(
                    new ValueSchema(12).validate(12, new Pointer(), defaultErrorFormatter, false)
                        .ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const result = new ValueSchema(12).validate(
                    'str',
                    new Pointer(),
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
                assert.ok(
                    new ValueSchema(true).validate(
                        true,
                        new Pointer(),
                        defaultErrorFormatter,
                        false,
                    ).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const result = new ValueSchema(true).validate(
                    'str',
                    new Pointer(),
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
                assert.ok(
                    new ValueSchema(null).validate(
                        null,
                        new Pointer(),
                        defaultErrorFormatter,
                        false,
                    ).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const result = new ValueSchema(null).validate(
                    'str',
                    new Pointer(),
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
                assert.ok(
                    new ValueSchema('str').cast('str', new Pointer(), defaultErrorFormatter, false)
                        .ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const result = new ValueSchema('str').cast(
                    '12',
                    new Pointer(),
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
                assert.ok(
                    new ValueSchema(12).cast('12', new Pointer(), defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const result = new ValueSchema(12).cast(
                    'str',
                    new Pointer(),
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
                assert.ok(
                    new ValueSchema(true).cast('true', new Pointer(), defaultErrorFormatter, false)
                        .ok,
                );
                assert.ok(
                    new ValueSchema(false).cast('', new Pointer(), defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const result = new ValueSchema(true).cast(
                    '',
                    new Pointer(),
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
                assert.ok(
                    new ValueSchema(null).cast('', new Pointer(), defaultErrorFormatter, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const result = new ValueSchema(null).cast(
                    'null',
                    new Pointer(),
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
