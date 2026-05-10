import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { ErrorKeeper, defaultErrorFormatter } from '../index';

import UnionSchema from './union-schema';
import NumberSchema from './number-schema';
import NullSchema from './null-schema';
import { transformToJSON } from '../heplers';

describe('UnionSchema', () => {
    describe('method validate', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper();
            assert.ok(
                new UnionSchema(new NumberSchema(), new NullSchema()).validate(
                    123,
                    errorKeeper,
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
            assert.ok(
                new UnionSchema(new NumberSchema(), new NullSchema()).validate(
                    null,
                    errorKeeper,
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper();
            const result = new UnionSchema(new NumberSchema(), new NullSchema()).validate(
                '1234',
                errorKeeper,
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
            const errorKeeper = new ErrorKeeper();
            assert.ok(
                new UnionSchema(new NumberSchema(), new NullSchema()).cast(
                    '123',
                    errorKeeper,
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
            assert.ok(
                new UnionSchema(new NumberSchema(), new NullSchema()).cast(
                    '',
                    errorKeeper,
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper();
            const result = new UnionSchema(new NumberSchema(), new NullSchema()).cast(
                {},
                errorKeeper,
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
