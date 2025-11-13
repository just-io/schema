import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { ErrorKeeper, defaultErrorFormatter } from '../index';

import UndefinedSchema from './undefined-schema';

describe('UndefinedSchema', () => {
    describe('method validate', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
            assert.ok(new UndefinedSchema().validate(undefined, errorKeeper, false).ok);
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
            assert.ok(!new UndefinedSchema().validate('1234', errorKeeper, false).ok);
            assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                { pointer: [], details: 'Should be "undefined" type.' },
            ]);
        });
    });

    describe('method cast', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
            assert.ok(new UndefinedSchema().cast('', errorKeeper, false).ok);
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
            assert.ok(!new UndefinedSchema().cast({}, errorKeeper, false).ok);
            assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                { pointer: [], details: 'Should be "string" type.' },
            ]);
        });
    });
});
