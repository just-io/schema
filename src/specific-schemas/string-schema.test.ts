import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { ErrorKeeper, defaultErrorFormatters } from '../index';

import StringSchema from './string-schema';

describe('StringSchema', () => {
    describe('method validate', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
            assert.ok(new StringSchema().validate('string', 'default', errorKeeper, false).ok);
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
            assert.ok(!new StringSchema().validate(12, 'default', errorKeeper, false).ok);
            assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                { pointer: [], details: 'Should be "string" type.' },
            ]);
        });

        describe('with regexp', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(
                    new StringSchema()
                        .regexp(/string/)
                        .validate('string', 'default', errorKeeper, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(
                    !new StringSchema()
                        .regexp(/string/)
                        .validate('strung', 'default', errorKeeper, false).ok,
                );
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should match regexp "string".' },
                ]);
            });
        });

        describe('with enum', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(
                    new StringSchema()
                        .enum(['string', 'str'])
                        .validate('string', 'default', errorKeeper, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(
                    !new StringSchema()
                        .enum(['string', 'str'])
                        .validate('strung', 'default', errorKeeper, false).ok,
                );
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    {
                        pointer: [],
                        details: 'Should be included in enum of values: "string", "str".',
                    },
                ]);
            });
        });

        describe('with max length', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(
                    new StringSchema().maxLength(2).validate('st', 'default', errorKeeper, false)
                        .ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(
                    !new StringSchema().maxLength(2).validate('str', 'default', errorKeeper, false)
                        .ok,
                );
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should contain less than or equal 2 symbols.' },
                ]);
            });
        });

        describe('with min length', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(
                    new StringSchema().minLength(2).validate('st', 'default', errorKeeper, false)
                        .ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(
                    !new StringSchema().minLength(2).validate('s', 'default', errorKeeper, false)
                        .ok,
                );
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should contain more than or equal 2 symbols.' },
                ]);
            });
        });
    });

    describe('method cast', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
            assert.ok(new StringSchema().cast('string', 'default', errorKeeper, false).ok);
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
            assert.ok(!new StringSchema().cast({}, 'default', errorKeeper, false).ok);
            assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                { pointer: [], details: 'Should be "string" type.' },
            ]);
        });

        describe('with regexp', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(
                    new StringSchema()
                        .regexp(/string/)
                        .cast('string', 'default', errorKeeper, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(
                    !new StringSchema()
                        .regexp(/string/)
                        .cast('strung', 'default', errorKeeper, false).ok,
                );
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should match regexp "string".' },
                ]);
            });
        });

        describe('with enum', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(
                    new StringSchema()
                        .enum(['string', 'str'])
                        .cast('string', 'default', errorKeeper, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(
                    !new StringSchema()
                        .enum(['string', 'str'])
                        .cast('strung', 'default', errorKeeper, false).ok,
                );
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    {
                        pointer: [],
                        details: 'Should be included in enum of values: "string", "str".',
                    },
                ]);
            });
        });

        describe('with max length', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(
                    new StringSchema().maxLength(2).cast('st', 'default', errorKeeper, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(
                    !new StringSchema().maxLength(2).cast('str', 'default', errorKeeper, false).ok,
                );
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should contain less than or equal 2 symbols.' },
                ]);
            });
        });

        describe('with min length', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(
                    new StringSchema().minLength(2).cast('st', 'default', errorKeeper, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(
                    !new StringSchema().minLength(2).cast('s', 'default', errorKeeper, false).ok,
                );
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should contain more than or equal 2 symbols.' },
                ]);
            });
        });
    });
});
