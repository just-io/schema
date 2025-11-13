import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { ErrorKeeper, defaultErrorFormatter } from '../index';

import ArraySchema from './array-schema';
import NumberSchema from './number-schema';

describe('ArraySchema', () => {
    describe('method validate', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
            assert.ok(
                new ArraySchema(new NumberSchema()).validate([1, 2, 3], errorKeeper, false).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
            assert.ok(!new ArraySchema(new NumberSchema()).validate(null, errorKeeper, false).ok);
            assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                { pointer: [], details: 'Should be "array" type.' },
            ]);
        });

        test('should return error result when item has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
            assert.ok(
                !new ArraySchema(new NumberSchema()).validate([1, 'name'], errorKeeper, false).ok,
            );
            assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                { pointer: ['1'], details: 'Should be "number" type.' },
            ]);
        });

        describe('with max items', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(
                    new ArraySchema(new NumberSchema())
                        .maxItems(3)
                        .validate([1, 2, 3], errorKeeper, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(
                    !new ArraySchema(new NumberSchema())
                        .maxItems(3)
                        .validate([1, 2, 3, 4], errorKeeper, false).ok,
                );
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should contain less than or equal 3 items.' },
                ]);
            });
        });

        describe('with min items', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(
                    new ArraySchema(new NumberSchema())
                        .minItems(3)
                        .validate([1, 2, 3], errorKeeper, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(
                    !new ArraySchema(new NumberSchema())
                        .minItems(3)
                        .validate([1, 2], errorKeeper, false).ok,
                );
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should contain more than or equal 3 items.' },
                ]);
            });
        });

        describe('with unique', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(
                    new ArraySchema(new NumberSchema())
                        .unique()
                        .validate([1, 2, 3], errorKeeper, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(
                    !new ArraySchema(new NumberSchema())
                        .unique()
                        .validate([1, 2, 3, 1], errorKeeper, false).ok,
                );
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'All items should be unique.' },
                ]);
            });
        });
    });

    describe('method cast', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
            assert.ok(
                new ArraySchema(new NumberSchema()).cast(['1', '2', '3'], errorKeeper, false).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
            assert.ok(!new ArraySchema(new NumberSchema()).cast(undefined, errorKeeper, false).ok);
            assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                { pointer: [], details: 'Should be "array" type.' },
            ]);
        });

        test('should return error result when item has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
            assert.ok(
                !new ArraySchema(new NumberSchema()).cast(['1', 'name'], errorKeeper, false).ok,
            );
            assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                { pointer: ['1'], details: 'Should be "number" type.' },
            ]);
        });

        describe('with max items', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(
                    new ArraySchema(new NumberSchema())
                        .maxItems(3)
                        .cast(['1', '2', '3'], errorKeeper, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(
                    !new ArraySchema(new NumberSchema())
                        .maxItems(3)
                        .cast(['1', '2', '3', '4'], errorKeeper, false).ok,
                );
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should contain less than or equal 3 items.' },
                ]);
            });
        });

        describe('with min items', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(
                    new ArraySchema(new NumberSchema())
                        .minItems(3)
                        .cast(['1', '2', '3'], errorKeeper, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(
                    !new ArraySchema(new NumberSchema())
                        .minItems(3)
                        .cast(['1', '2'], errorKeeper, false).ok,
                );
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should contain more than or equal 3 items.' },
                ]);
            });
        });

        describe('with unique', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(
                    new ArraySchema(new NumberSchema())
                        .unique()
                        .cast(['1', '2', '3'], errorKeeper, false).ok,
                );
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(
                    !new ArraySchema(new NumberSchema())
                        .unique()
                        .cast(['1', '2', '3', '1'], errorKeeper, false).ok,
                );
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'All items should be unique.' },
                ]);
            });
        });
    });
});
