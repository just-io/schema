import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import NullSchema from './null-schema';
import { transformToJSON } from '../heplers';
import { defaultErrorFormatter } from '../error-formatter';
import { Pointer } from '../pointer';

describe('NullSchema', () => {
    describe('method validate', () => {
        test('should return value result when value has right type', () => {
            assert.ok(
                new NullSchema().validate(null, new Pointer(), defaultErrorFormatter, false).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const result = new NullSchema().validate(
                '1234',
                new Pointer(),
                defaultErrorFormatter,
                false,
            );
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: [], detail: 'Should be "null" type.' },
            ]);
        });
    });

    describe('method cast', () => {
        test('should return value result when value has right type', () => {
            assert.ok(new NullSchema().cast('', new Pointer(), defaultErrorFormatter, false).ok);
        });

        test('should return error result when value has not right type and has errors', () => {
            const result = new NullSchema().cast({}, new Pointer(), defaultErrorFormatter, false);
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: [], detail: 'Should be "string" type.' },
            ]);
        });
    });
});
