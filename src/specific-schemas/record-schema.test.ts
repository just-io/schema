import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import RecordSchema from './record-schema';
import StringSchema from './string-schema';
import { transformToJSON } from '../heplers';
import { Pointer } from '../pointer';
import { defaultErrorFormatter } from '../error-formatter';

describe('RecordSchema', () => {
    describe('method validate', () => {
        test('should return value result when value has right type', () => {
            assert.ok(
                new RecordSchema(new StringSchema()).validate(
                    { name: 'name', message: 'message' },
                    new Pointer(),
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const result = new RecordSchema(new StringSchema()).validate(
                { name: 'name', age: 12 },
                new Pointer(),
                defaultErrorFormatter,
                false,
            );
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: ['age'], detail: 'Should be "string" type.' },
            ]);
        });
    });

    describe('method cast', () => {
        test('should return value result when value has right type', () => {
            assert.ok(
                new RecordSchema(new StringSchema()).cast(
                    { name: 'name', message: 'message' },
                    new Pointer(),
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const result = new RecordSchema(new StringSchema()).cast(
                { name: 'name', age: {} },
                new Pointer(),
                defaultErrorFormatter,
                false,
            );
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: ['age'], detail: 'Should be "string" type.' },
            ]);
        });
    });
});
