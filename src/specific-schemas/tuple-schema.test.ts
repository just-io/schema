import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { ErrorKeeper, defaultErrorFormatter } from '../index';

import TupleSchema from './tuple-schema';
import NumberSchema from './number-schema';
import StringSchema from './string-schema';
import { transformToJSON } from '../heplers';

describe('TupleSchema', () => {
    describe('method validate', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper();
            assert.ok(
                new TupleSchema(new NumberSchema(), new StringSchema()).validate(
                    [12, 'name'],
                    errorKeeper,
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper();
            const result = new TupleSchema(new NumberSchema(), new StringSchema()).validate(
                ['name', 12],
                errorKeeper,
                defaultErrorFormatter,
                false,
            );
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: ['0'], detail: 'Should be "number" type.' },
                { pointer: ['1'], detail: 'Should be "string" type.' },
            ]);
        });
    });

    describe('method cast', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper();
            assert.ok(
                new TupleSchema(new NumberSchema(), new StringSchema()).cast(
                    ['12', 'name'],
                    errorKeeper,
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper();
            const result = new TupleSchema(new NumberSchema(), new StringSchema()).cast(
                ['name', 'surname'],
                errorKeeper,
                defaultErrorFormatter,
                false,
            );
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: ['0'], detail: 'Should be "number" type.' },
            ]);
        });
    });
});
