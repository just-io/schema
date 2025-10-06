import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { ErrorKeeper, defaultErrorFormatters } from '../index';

import ValueSchema from './value-schema';

describe('ValueSchema', () => {
    describe('method validate', () => {
        describe('for string value', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(new ValueSchema('str').validate('str', 'default', errorKeeper, false).ok);
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(!new ValueSchema('str').validate(12, 'default', errorKeeper, false).ok);
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should be equal "str".' },
                ]);
            });
        });

        describe('for number value', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(new ValueSchema(12).validate(12, 'default', errorKeeper, false).ok);
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(!new ValueSchema(12).validate('str', 'default', errorKeeper, false).ok);
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should be equal "12".' },
                ]);
            });
        });

        describe('for boolean value', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(new ValueSchema(true).validate(true, 'default', errorKeeper, false).ok);
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(!new ValueSchema(true).validate('str', 'default', errorKeeper, false).ok);
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should be equal "true".' },
                ]);
            });
        });

        describe('for null value', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(new ValueSchema(null).validate(null, 'default', errorKeeper, false).ok);
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(!new ValueSchema(null).validate('str', 'default', errorKeeper, false).ok);
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should be equal "null".' },
                ]);
            });
        });
    });

    describe('method cast', () => {
        describe('for string value', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(new ValueSchema('str').cast('str', 'default', errorKeeper, false).ok);
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(!new ValueSchema('str').cast('12', 'default', errorKeeper, false).ok);
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should be equal "str".' },
                ]);
            });
        });

        describe('for number value', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(new ValueSchema(12).cast('12', 'default', errorKeeper, false).ok);
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(!new ValueSchema(12).cast('str', 'default', errorKeeper, false).ok);
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should be equal "12".' },
                ]);
            });
        });

        describe('for boolean value', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(new ValueSchema(true).cast('true', 'default', errorKeeper, false).ok);
                assert.ok(new ValueSchema(false).cast('', 'default', errorKeeper, false).ok);
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(!new ValueSchema(true).cast('', 'default', errorKeeper, false).ok);
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should contain more than or equal 1 symbols.' },
                ]);
            });
        });

        describe('for null value', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(new ValueSchema(null).cast('', 'default', errorKeeper, false).ok);
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
                assert.ok(!new ValueSchema(null).cast('null', 'default', errorKeeper, false).ok);
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should contain less than or equal 0 symbols.' },
                ]);
            });
        });
    });
});
