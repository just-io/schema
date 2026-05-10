import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import CustomSchema from './custom-schema';
import { Result } from '../result';
import { ErrorSet } from '../error-set';
import { defaultErrorFormatter } from '../error-formatter';
import { ValidationError, ErrorKeeper } from '../error-keeper';

describe('CustomSchema', () => {
    const customFileSchema = new CustomSchema<File, 'default'>({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        cast(value, errorKeeper, useDefault) {
            if (value instanceof File) {
                return { ok: true, value };
            } else {
                errorKeeper.push({ detail: 'Should be File.' });
                return { ok: false, error: errorKeeper.makeErrorSet() };
            }
        },
        makeJSONSchema(pointer, defs, lang) {
            return {
                title: this.getTitle(lang),
                description: this.getDescription(lang),
                defaut: this.getDefault(),
            };
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        validate(value, errorKeeper, useDefault): Result<File, ErrorSet<ValidationError>> {
            if (value instanceof File) {
                return { ok: true, value };
            } else {
                errorKeeper.push({ detail: 'Should be File.' });
                return { ok: false, error: errorKeeper.makeErrorSet() };
            }
        },
    });

    describe('method validate', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper();
            assert.ok(
                customFileSchema.validate(
                    new File([], 'test'),
                    errorKeeper,
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper();
            assert.ok(!customFileSchema.validate(12, errorKeeper, defaultErrorFormatter, false).ok);
        });
    });

    describe('method cast', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper();
            assert.ok(
                customFileSchema.cast(
                    new File([], 'test'),
                    errorKeeper,
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper();
            assert.ok(!customFileSchema.cast('', errorKeeper, defaultErrorFormatter, false).ok);
        });
    });
});
