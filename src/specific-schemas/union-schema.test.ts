import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import UnionSchema from './union-schema';
import NumberSchema from './number-schema';
import NullSchema from './null-schema';
import { transformToJSON } from '../helpers';
import { Pointer } from '../pointer';
import { defaultErrorFormatter } from '../error-formatter';

describe('UnionSchema', () => {
    describe('method validate', () => {
        test('should return value result when value has right type', () => {
            assert.ok(
                new UnionSchema(new NumberSchema(), new NullSchema()).validate(
                    123,
                    new Pointer(),
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
            assert.ok(
                new UnionSchema(new NumberSchema(), new NullSchema()).validate(
                    null,
                    new Pointer(),
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const result = new UnionSchema(new NumberSchema(), new NullSchema()).validate(
                '1234',
                new Pointer(),
                defaultErrorFormatter,
                false,
            );
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: [], group: 0, detail: 'Should be "number" type.' },
                { pointer: [], group: 1, detail: 'Should be "null" type.' },
            ]);
        });
    });

    describe('method cast', () => {
        test('should return value result when value has right type', () => {
            assert.ok(
                new UnionSchema(new NumberSchema(), new NullSchema()).cast(
                    '123',
                    new Pointer(),
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
            assert.ok(
                new UnionSchema(new NumberSchema(), new NullSchema()).cast(
                    '',
                    new Pointer(),
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const result = new UnionSchema(new NumberSchema(), new NullSchema()).cast(
                {},
                new Pointer(),
                defaultErrorFormatter,
                false,
            );
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: [], group: 0, detail: 'Should be "number" type.' },
                { pointer: [], group: 1, detail: 'Should be "string" type.' },
            ]);
        });
    });
});
