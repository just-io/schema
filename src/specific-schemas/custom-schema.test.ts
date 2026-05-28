import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import CustomSchema from './custom-schema';
import { Result } from '../result';
import { ErrorSet } from '../error-set';
import { defaultErrorFormatter } from '../error-formatter';
import { Pointer } from '../pointer';
import { ValidationError } from '../schema';

describe('CustomSchema', () => {
    const customFileSchema = new CustomSchema<File>({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        cast(value, pointer, useDefault) {
            if (value instanceof File) {
                return { ok: true, value };
            } else {
                return {
                    ok: false,
                    error: new ErrorSet<ValidationError>().add({
                        pointer,
                        detail: 'Should be File.',
                    }),
                };
            }
        },
        makeJSONSchema(pointer, defs, lang) {
            return {
                title: this.getTitle(lang),
                description: this.getDescription(lang),
                default: this.getDefault(),
            };
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        validate(value, pointer, useDefault): Result<File, ErrorSet<ValidationError>> {
            if (value instanceof File) {
                return { ok: true, value };
            } else {
                return {
                    ok: false,
                    error: new ErrorSet<ValidationError>().add({
                        pointer,
                        detail: 'Should be File.',
                    }),
                };
            }
        },
    });

    describe('method validate', () => {
        test('should return value result when value has right type', () => {
            assert.ok(
                customFileSchema.validate(
                    new File([], 'test'),
                    new Pointer(),
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            assert.ok(
                !customFileSchema.validate(12, new Pointer(), defaultErrorFormatter, false).ok,
            );
        });
    });

    describe('method cast', () => {
        test('should return value result when value has right type', () => {
            assert.ok(
                customFileSchema.cast(
                    new File([], 'test'),
                    new Pointer(),
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            assert.ok(!customFileSchema.cast('', new Pointer(), defaultErrorFormatter, false).ok);
        });
    });
});
