import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { ErrorKeeper, defaultErrorFormatters } from '../index';

import OptionalSchema from './optional-schema';
import NumberSchema from './number-schema';

describe('OptionalSchema', () => {
    describe('method validate', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
            assert.ok(
                new OptionalSchema(new NumberSchema()).validate(123, 'default', errorKeeper, false)
                    .ok,
            );
            assert.ok(
                new OptionalSchema(new NumberSchema()).validate(
                    undefined,
                    'default',
                    errorKeeper,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
            assert.ok(
                !new OptionalSchema(new NumberSchema()).validate(
                    '1234',
                    'default',
                    errorKeeper,
                    false,
                ).ok,
            );
            assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                { pointer: [], details: 'Should be "number" type.' },
            ]);
        });
    });

    describe('method cast', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
            assert.ok(
                new OptionalSchema(new NumberSchema()).cast('123', 'default', errorKeeper, false)
                    .ok,
            );
            assert.ok(
                new OptionalSchema(new NumberSchema()).cast(
                    undefined,
                    'default',
                    errorKeeper,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
            assert.ok(
                !new OptionalSchema(new NumberSchema()).cast({}, 'default', errorKeeper, false).ok,
            );
            assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                { pointer: [], details: 'Should be "number" type.' },
            ]);
        });
    });
});
