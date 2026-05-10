import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { ErrorKeeper, defaultErrorFormatter } from '../index';

import BooleanSchema from './boolean-schema';
import { transformToJSON } from '../heplers';

describe('BooleanSchema', () => {
    describe('method validate', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper();
            assert.ok(
                new BooleanSchema().validate(true, errorKeeper, defaultErrorFormatter, false).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper();
            const result = new BooleanSchema().validate(
                '1234',
                errorKeeper,
                defaultErrorFormatter,
                false,
            );
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: [], detail: 'Should be "boolean" type.' },
            ]);
        });
    });

    describe('method cast', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper();
            assert.ok(
                new BooleanSchema().cast('true', errorKeeper, defaultErrorFormatter, false).ok,
            );
            assert.ok(new BooleanSchema().cast('', errorKeeper, defaultErrorFormatter, false).ok);
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper();
            const result = new BooleanSchema().cast({}, errorKeeper, defaultErrorFormatter, false);
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: [], detail: 'Should be "string" type.' },
            ]);
        });
    });
});
