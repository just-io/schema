import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { ErrorKeeper, defaultErrorFormatters } from '../index';

import TupleSchema from './tuple-schema';
import NumberSchema from './number-schema';
import StringSchema from './string-schema';

describe('TupleSchema', () => {
    describe('method validate', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
            assert.ok(
                new TupleSchema(new NumberSchema(), new StringSchema()).validate(
                    [12, 'name'],
                    'default',
                    errorKeeper,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
            assert.ok(
                !new TupleSchema(new NumberSchema(), new StringSchema()).validate(
                    ['name', 12],
                    'default',
                    errorKeeper,
                    false,
                ).ok,
            );
            assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                { pointer: ['0'], details: 'Should be "number" type.' },
                { pointer: ['1'], details: 'Should be "string" type.' },
            ]);
        });
    });

    describe('method cast', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
            assert.ok(
                new TupleSchema(new NumberSchema(), new StringSchema()).cast(
                    ['12', 'name'],
                    'default',
                    errorKeeper,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
            assert.ok(
                !new TupleSchema(new NumberSchema(), new StringSchema()).cast(
                    ['name', 'surname'],
                    'default',
                    errorKeeper,
                    false,
                ).ok,
            );
            assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                { pointer: ['0'], details: 'Should be "number" type.' },
            ]);
        });
    });
});
