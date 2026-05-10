import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { ErrorKeeper, defaultErrorFormatter } from '../index';

import ExtendedSchema from './extended-schema';
import RecordSchema from './record-schema';
import StringSchema from './string-schema';
import { transformToJSON } from '../heplers';

describe('ExtendedSchema', () => {
    function extendedValidator(
        value: Record<string, string>,
        lang: 'default',
        innerErrorKeeper: ErrorKeeper,
    ): boolean {
        if (Object.keys(value).length === 0) {
            innerErrorKeeper.push({ detail: 'Should ne not empty.' });
            return false;
        }
        return true;
    }

    describe('method validate', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper();
            assert.ok(
                new ExtendedSchema(
                    new RecordSchema(new StringSchema()),
                    extendedValidator,
                ).validate(
                    { name: 'name', message: 'message' },
                    errorKeeper,
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper();
            const result = new ExtendedSchema(
                new RecordSchema(new StringSchema()),
                extendedValidator,
            ).validate({}, errorKeeper, defaultErrorFormatter, false);
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: [], detail: 'Should ne not empty.' },
            ]);
        });
    });

    describe('method cast', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper();
            assert.ok(
                new ExtendedSchema(new RecordSchema(new StringSchema()), extendedValidator).cast(
                    { name: 'name', message: 'message' },
                    errorKeeper,
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper();
            const result = new ExtendedSchema(
                new RecordSchema(new StringSchema()),
                extendedValidator,
            ).cast({}, errorKeeper, defaultErrorFormatter, false);
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: [], detail: 'Should ne not empty.' },
            ]);
        });
    });
});
