import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { ErrorKeeper, defaultErrorFormatter } from '../index';

import UnionSchema from './union-schema';
import NumberSchema from './number-schema';
import NullSchema from './null-schema';

describe('UnionSchema', () => {
    describe('method validate', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
            assert.ok(
                new UnionSchema(new NumberSchema(), new NullSchema()).validate(
                    123,
                    errorKeeper,
                    false,
                ).ok,
            );
            assert.ok(
                new UnionSchema(new NumberSchema(), new NullSchema()).validate(
                    null,
                    errorKeeper,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
            assert.ok(
                !new UnionSchema(new NumberSchema(), new NullSchema()).validate(
                    '1234',
                    errorKeeper,
                    false,
                ).ok,
            );
            assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                { pointer: [], group: 0, details: 'Should be "number" type.' },
                { pointer: [], group: 1, details: 'Should be "null" type.' },
            ]);
        });
    });

    describe('method cast', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
            assert.ok(
                new UnionSchema(new NumberSchema(), new NullSchema()).cast(
                    '123',
                    errorKeeper,
                    false,
                ).ok,
            );
            assert.ok(
                new UnionSchema(new NumberSchema(), new NullSchema()).cast('', errorKeeper, false)
                    .ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
            assert.ok(
                !new UnionSchema(new NumberSchema(), new NullSchema()).cast({}, errorKeeper, false)
                    .ok,
            );
            assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                { pointer: [], group: 0, details: 'Should be "number" type.' },
                { pointer: [], group: 1, details: 'Should be "string" type.' },
            ]);
        });
    });
});
