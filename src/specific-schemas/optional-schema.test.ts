import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { ErrorKeeper, defaultErrorFormatter } from '../index';

import OptionalSchema from './optional-schema';
import NumberSchema from './number-schema';
import { transformToJSON } from '../heplers';

describe('OptionalSchema', () => {
    describe('method validate', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper();
            assert.ok(
                new OptionalSchema(new NumberSchema()).validate(
                    123,
                    errorKeeper,
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
            assert.ok(
                new OptionalSchema(new NumberSchema()).validate(
                    undefined,
                    errorKeeper,
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper();
            const result = new OptionalSchema(new NumberSchema()).validate(
                '1234',
                errorKeeper,
                defaultErrorFormatter,
                false,
            );
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: [], detail: 'Should be "number" type.' },
            ]);
        });
    });

    describe('method cast', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper();
            assert.ok(
                new OptionalSchema(new NumberSchema()).cast(
                    '123',
                    errorKeeper,
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
            assert.ok(
                new OptionalSchema(new NumberSchema()).cast(
                    undefined,
                    errorKeeper,
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper();
            const result = new OptionalSchema(new NumberSchema()).cast(
                {},
                errorKeeper,
                defaultErrorFormatter,
                false,
            );
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: [], detail: 'Should be "number" type.' },
            ]);
        });
    });
});
