import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { ErrorKeeper, defaultErrorFormatters } from '../index';

import NumberSchema from './number-schema';

describe('NumberSchema', () => {
    describe('method validate', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
            assert.ok(new NumberSchema().validate(1234, 'default', errorKeeper, false).ok);
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
            assert.ok(!new NumberSchema().validate('1234', 'default', errorKeeper, false).ok);
            assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                { pointer: [], details: 'Should be "number" type.' },
            ]);
        });

        describe('with enum', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(
                    new NumberSchema().enum([1, 2, 3]).validate(1, 'default', errorKeeper, false)
                        .ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(
                    !new NumberSchema().enum([1, 2, 3]).validate(0, 'default', errorKeeper, false)
                        .ok,
                );
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should be included in enum of values: 1, 2, 3.' },
                ]);
            });
        });

        describe('with maximum', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(
                    new NumberSchema().maximum(2).validate(2, 'default', errorKeeper, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(
                    !new NumberSchema().maximum(2).validate(3, 'default', errorKeeper, false).ok,
                );
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should be less than or equal 2.' },
                ]);
            });
        });

        describe('with minimum', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(
                    new NumberSchema().minimum(2).validate(2, 'default', errorKeeper, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(
                    !new NumberSchema().minimum(2).validate(1, 'default', errorKeeper, false).ok,
                );
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should be more than or equal 2.' },
                ]);
            });
        });

        describe('with integer', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(
                    new NumberSchema().integer().validate(2, 'default', errorKeeper, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(
                    !new NumberSchema().integer().validate(3.1, 'default', errorKeeper, false).ok,
                );
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should be integer value.' },
                ]);
            });
        });
    });

    describe('method cast', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
            assert.ok(new NumberSchema().cast('1234', 'default', errorKeeper, false).ok);
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
            assert.ok(!new NumberSchema().cast('str', 'default', errorKeeper, false).ok);
            assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                { pointer: [], details: 'Should be "number" type.' },
            ]);
        });

        describe('with enum', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(
                    new NumberSchema().enum([1, 2, 3]).cast('1', 'default', errorKeeper, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(
                    !new NumberSchema().enum([1, 2, 3]).cast('0', 'default', errorKeeper, false).ok,
                );
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should be included in enum of values: 1, 2, 3.' },
                ]);
            });
        });

        describe('with maximum', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(
                    new NumberSchema().maximum(2).cast('2', 'default', errorKeeper, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(
                    !new NumberSchema().maximum(2).cast('3', 'default', errorKeeper, false).ok,
                );
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should be less than or equal 2.' },
                ]);
            });
        });

        describe('with minimum', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(
                    new NumberSchema().minimum(2).cast('2', 'default', errorKeeper, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(
                    !new NumberSchema().minimum(2).cast('1', 'default', errorKeeper, false).ok,
                );
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should be more than or equal 2.' },
                ]);
            });
        });

        describe('with integer', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(new NumberSchema().integer().cast('2', 'default', errorKeeper, false).ok);
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(
                    !new NumberSchema().integer().cast('3.1', 'default', errorKeeper, false).ok,
                );
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should be integer value.' },
                ]);
            });
        });
    });
});
