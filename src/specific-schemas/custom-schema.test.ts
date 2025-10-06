import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { ErrorKeeper, defaultErrorFormatters } from '../index';

import CustomSchema from './custom-schema';
import { Result } from '../schema';

describe('CustomSchema', () => {
    const customFileSchema = new CustomSchema<File, 'default'>({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        cast(value, lang, errorKeeper, useDefault) {
            if (value instanceof File) {
                return { ok: true, value };
            } else {
                errorKeeper.push('Should be File.');
                return { ok: false, error: true };
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
        validate(value, lang, errorKeeper, useDefault): Result<File, unknown> {
            if (value instanceof File) {
                return { ok: true, value };
            } else {
                errorKeeper.push('Should be File.');
                return { ok: false, error: true };
            }
        },
    });

    describe('method validate', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
            assert.ok(
                customFileSchema.validate(new File([], 'test'), 'default', errorKeeper, false).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
            assert.ok(!customFileSchema.validate(12, 'default', errorKeeper, false).ok);
        });
    });

    describe('method cast', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
            assert.ok(
                customFileSchema.cast(new File([], 'test'), 'default', errorKeeper, false).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
            assert.ok(!customFileSchema.cast('', 'default', errorKeeper, false).ok);
        });
    });
});
