import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import NullableSchema from './nullable-schema';
import NumberSchema from './number-schema';
import { transformToJSON } from '../heplers';
import { Pointer } from '../pointer';
import { defaultErrorFormatter } from '../error-formatter';

describe('NullableSchema', () => {
    describe('method validate', () => {
        test('should return value result when value has right type', () => {
            assert.ok(
                new NullableSchema(new NumberSchema()).validate(
                    123,
                    new Pointer(),
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
            assert.ok(
                new NullableSchema(new NumberSchema()).validate(
                    null,
                    new Pointer(),
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const result = new NullableSchema(new NumberSchema()).validate(
                '1234',
                new Pointer(),
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
            assert.ok(
                new NullableSchema(new NumberSchema()).cast(
                    '123',
                    new Pointer(),
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
            assert.ok(
                new NullableSchema(new NumberSchema()).cast(
                    undefined,
                    new Pointer(),
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const result = new NullableSchema(new NumberSchema()).cast(
                {},
                new Pointer(),
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
