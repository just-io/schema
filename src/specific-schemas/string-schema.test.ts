import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { ErrorKeeper, defaultErrorFormatter } from '../index';

import StringSchema from './string-schema';

describe('StringSchema', () => {
    describe('method validate', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
            assert.ok(new StringSchema().validate('string', errorKeeper, false).ok);
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
            assert.ok(!new StringSchema().validate(12, errorKeeper, false).ok);
            assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                { pointer: [], details: 'Should be "string" type.' },
            ]);
        });

        describe('with regexp', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(
                    new StringSchema().regexp(/string/).validate('string', errorKeeper, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(
                    !new StringSchema().regexp(/string/).validate('strung', errorKeeper, false).ok,
                );
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should match regexp "string".' },
                ]);
            });
        });

        describe('with enum', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(
                    new StringSchema()
                        .enum(['string', 'str'])
                        .validate('string', errorKeeper, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(
                    !new StringSchema()
                        .enum(['string', 'str'])
                        .validate('strung', errorKeeper, false).ok,
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
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(new StringSchema().maxLength(2).validate('st', errorKeeper, false).ok);
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(!new StringSchema().maxLength(2).validate('str', errorKeeper, false).ok);
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should contain less than or equal 2 symbols.' },
                ]);
            });
        });

        describe('with min length', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(new StringSchema().minLength(2).validate('st', errorKeeper, false).ok);
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(!new StringSchema().minLength(2).validate('s', errorKeeper, false).ok);
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should contain more than or equal 2 symbols.' },
                ]);
            });
        });
    });

    describe('method cast', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
            assert.ok(new StringSchema().cast('string', errorKeeper, false).ok);
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
            assert.ok(!new StringSchema().cast({}, errorKeeper, false).ok);
            assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                { pointer: [], details: 'Should be "string" type.' },
            ]);
        });

        describe('with regexp', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(
                    new StringSchema().regexp(/string/).cast('string', errorKeeper, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(
                    !new StringSchema().regexp(/string/).cast('strung', errorKeeper, false).ok,
                );
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should match regexp "string".' },
                ]);
            });
        });

        describe('with enum', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(
                    new StringSchema().enum(['string', 'str']).cast('string', errorKeeper, false)
                        .ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(
                    !new StringSchema().enum(['string', 'str']).cast('strung', errorKeeper, false)
                        .ok,
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
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(new StringSchema().maxLength(2).cast('st', errorKeeper, false).ok);
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(!new StringSchema().maxLength(2).cast('str', errorKeeper, false).ok);
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should contain less than or equal 2 symbols.' },
                ]);
            });
        });

        describe('with min length', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(new StringSchema().minLength(2).cast('st', errorKeeper, false).ok);
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(!new StringSchema().minLength(2).cast('s', errorKeeper, false).ok);
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should contain more than or equal 2 symbols.' },
                ]);
            });
        });
    });
});
