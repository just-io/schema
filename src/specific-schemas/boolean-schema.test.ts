import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import BooleanSchema from './boolean-schema';
import { transformToJSON } from '../heplers';
import { Pointer } from '../pointer';
import { defaultErrorFormatter } from '../error-formatter';

describe('BooleanSchema', () => {
    describe('method validate', () => {
        test('should return value result when value has right type', () => {
            assert.ok(
                new BooleanSchema().validate(true, new Pointer(), defaultErrorFormatter, false).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const result = new BooleanSchema().validate(
                '1234',
                new Pointer(),
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
            assert.ok(
                new BooleanSchema().cast('true', new Pointer(), defaultErrorFormatter, false).ok,
            );
            assert.ok(new BooleanSchema().cast('', new Pointer(), defaultErrorFormatter, false).ok);
        });

        test('should return error result when value has not right type and has errors', () => {
            const result = new BooleanSchema().cast(
                {},
                new Pointer(),
                defaultErrorFormatter,
                false,
            );
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: [], detail: 'Should be "string" type.' },
            ]);
        });
    });
});
