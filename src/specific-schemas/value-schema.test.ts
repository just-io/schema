import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { ErrorKeeper, defaultErrorFormatter } from '../index';

import ValueSchema from './value-schema';

describe('ValueSchema', () => {
    describe('method validate', () => {
        describe('for string value', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(new ValueSchema('str').validate('str', errorKeeper, false).ok);
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(!new ValueSchema('str').validate(12, errorKeeper, false).ok);
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should be equal "str".' },
                ]);
            });
        });

        describe('for number value', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(new ValueSchema(12).validate(12, errorKeeper, false).ok);
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(!new ValueSchema(12).validate('str', errorKeeper, false).ok);
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should be equal "12".' },
                ]);
            });
        });

        describe('for boolean value', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(new ValueSchema(true).validate(true, errorKeeper, false).ok);
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(!new ValueSchema(true).validate('str', errorKeeper, false).ok);
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should be equal "true".' },
                ]);
            });
        });

        describe('for null value', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(new ValueSchema(null).validate(null, errorKeeper, false).ok);
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(!new ValueSchema(null).validate('str', errorKeeper, false).ok);
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should be equal "null".' },
                ]);
            });
        });
    });

    describe('method cast', () => {
        describe('for string value', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(new ValueSchema('str').cast('str', errorKeeper, false).ok);
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(!new ValueSchema('str').cast('12', errorKeeper, false).ok);
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should be equal "str".' },
                ]);
            });
        });

        describe('for number value', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(new ValueSchema(12).cast('12', errorKeeper, false).ok);
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(!new ValueSchema(12).cast('str', errorKeeper, false).ok);
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should be equal "12".' },
                ]);
            });
        });

        describe('for boolean value', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(new ValueSchema(true).cast('true', errorKeeper, false).ok);
                assert.ok(new ValueSchema(false).cast('', errorKeeper, false).ok);
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(!new ValueSchema(true).cast('', errorKeeper, false).ok);
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should contain more than or equal 1 symbols.' },
                ]);
            });
        });

        describe('for null value', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(new ValueSchema(null).cast('', errorKeeper, false).ok);
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(!new ValueSchema(null).cast('null', errorKeeper, false).ok);
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should contain less than or equal 0 symbols.' },
                ]);
            });
        });
    });
});
