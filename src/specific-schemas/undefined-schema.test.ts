import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import UndefinedSchema from './undefined-schema';
import { transformToJSON } from '../helpers';
import { Pointer } from '../pointer';
import { defaultErrorFormatter } from '../error-formatter';

describe('UndefinedSchema', () => {
    describe('method validate', () => {
        test('should return value result when value has right type', () => {
            assert.ok(
                new UndefinedSchema().validate(
                    undefined,
                    new Pointer(),
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const result = new UndefinedSchema().validate(
                '1234',
                new Pointer(),
                defaultErrorFormatter,
                false,
            );
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: [], detail: 'Should be "undefined" type.' },
            ]);
        });
    });

    describe('method cast', () => {
        test('should return value result when value has right type', () => {
            assert.ok(
                new UndefinedSchema().cast('', new Pointer(), defaultErrorFormatter, false).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const result = new UndefinedSchema().cast(
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
