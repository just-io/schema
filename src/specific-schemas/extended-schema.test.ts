import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import ExtendedSchema from './extended-schema';
import RecordSchema from './record-schema';
import StringSchema from './string-schema';
import { transformToJSON } from '../helpers';
import { Result } from '../result';
import { Pointer } from '../pointer';
import { defaultErrorFormatter } from '../error-formatter';

describe('ExtendedSchema', () => {
    function extendedValidator(
        value: Record<string, string>,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        lang: string,
    ): Result<true, string> {
        if (Object.keys(value).length === 0) {
            return {
                ok: false,
                error: 'Should ne not empty.',
            };
        }
        return {
            ok: true,
            value: true,
        };
    }

    describe('method validate', () => {
        test('should return value result when value has right type', () => {
            assert.ok(
                new ExtendedSchema(
                    new RecordSchema(new StringSchema()),
                    extendedValidator,
                ).validate(
                    { name: 'name', message: 'message' },
                    new Pointer(),
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const result = new ExtendedSchema(
                new RecordSchema(new StringSchema()),
                extendedValidator,
            ).validate({}, new Pointer(), defaultErrorFormatter, false);
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: [], detail: 'Should ne not empty.' },
            ]);
        });
    });

    describe('method cast', () => {
        test('should return value result when value has right type', () => {
            assert.ok(
                new ExtendedSchema(new RecordSchema(new StringSchema()), extendedValidator).cast(
                    { name: 'name', message: 'message' },
                    new Pointer(),
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const result = new ExtendedSchema(
                new RecordSchema(new StringSchema()),
                extendedValidator,
            ).cast({}, new Pointer(), defaultErrorFormatter, false);
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: [], detail: 'Should ne not empty.' },
            ]);
        });
    });
});
