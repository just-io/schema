import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import OptionalSchema from './optional-schema';
import NumberSchema from './number-schema';
import { transformToJSON } from '../helpers';
import { Pointer } from '../pointer';
import { defaultErrorFormatter } from '../error-formatter';

describe('OptionalSchema', () => {
    describe('method validate', () => {
        test('should return value result when value has right type', () => {
            assert.ok(
                new OptionalSchema(new NumberSchema()).validate(
                    123,
                    new Pointer(),
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
            assert.ok(
                new OptionalSchema(new NumberSchema()).validate(
                    undefined,
                    new Pointer(),
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const result = new OptionalSchema(new NumberSchema()).validate(
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
                new OptionalSchema(new NumberSchema()).cast(
                    '123',
                    new Pointer(),
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
            assert.ok(
                new OptionalSchema(new NumberSchema()).cast(
                    undefined,
                    new Pointer(),
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const result = new OptionalSchema(new NumberSchema()).cast(
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
