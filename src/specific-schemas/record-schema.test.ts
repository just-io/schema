import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { ErrorKeeper, defaultErrorFormatter } from '../index';

import RecordSchema from './record-schema';
import StringSchema from './string-schema';

describe('RecordSchema', () => {
    describe('method validate', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
            assert.ok(
                new RecordSchema(new StringSchema()).validate(
                    { name: 'name', message: 'message' },
                    errorKeeper,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
            assert.ok(
                !new RecordSchema(new StringSchema()).validate(
                    { name: 'name', age: 12 },
                    errorKeeper,
                    false,
                ).ok,
            );
            assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                { pointer: ['age'], details: 'Should be "string" type.' },
            ]);
        });
    });

    describe('method cast', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
            assert.ok(
                new RecordSchema(new StringSchema()).cast(
                    { name: 'name', message: 'message' },
                    errorKeeper,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
            assert.ok(
                !new RecordSchema(new StringSchema()).cast(
                    { name: 'name', age: {} },
                    errorKeeper,
                    false,
                ).ok,
            );
            assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                { pointer: ['age'], details: 'Should be "string" type.' },
            ]);
        });
    });
});
