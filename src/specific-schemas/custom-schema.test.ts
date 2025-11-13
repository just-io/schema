import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { ErrorKeeper, defaultErrorFormatter } from '../index';

import CustomSchema from './custom-schema';
import { Result } from '../schema';

describe('CustomSchema', () => {
    const customFileSchema = new CustomSchema<File, 'default'>({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        cast(value, errorKeeper, useDefault) {
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
        validate(value, errorKeeper, useDefault): Result<File, unknown> {
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
            const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
            assert.ok(customFileSchema.validate(new File([], 'test'), errorKeeper, false).ok);
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
            assert.ok(!customFileSchema.validate(12, errorKeeper, false).ok);
        });
    });

    describe('method cast', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
            assert.ok(customFileSchema.cast(new File([], 'test'), errorKeeper, false).ok);
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
            assert.ok(!customFileSchema.cast('', errorKeeper, false).ok);
        });
    });
});
