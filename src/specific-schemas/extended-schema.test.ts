import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { ErrorKeeper, defaultErrorFormatter } from '../index';

import ExtendedSchema from './extended-schema';
import RecordSchema from './record-schema';
import StringSchema from './string-schema';

describe('ExtendedSchema', () => {
    function extendedValidator(
        value: Record<string, string>,
        lang: 'default',
        innerErrorKeeper: ErrorKeeper<'default'>,
    ): boolean {
        if (Object.keys(value).length === 0) {
            innerErrorKeeper.push('Should ne not empty.');
            return false;
        }
        return true;
    }

    describe('method validate', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
            assert.ok(
                new ExtendedSchema(
                    new RecordSchema(new StringSchema()),
                    extendedValidator,
                ).validate({ name: 'name', message: 'message' }, errorKeeper, false).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
            assert.ok(
                !new ExtendedSchema(
                    new RecordSchema(new StringSchema()),
                    extendedValidator,
                ).validate({}, errorKeeper, false).ok,
            );
            assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                { pointer: [], details: 'Should ne not empty.' },
            ]);
        });
    });

    describe('method cast', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
            assert.ok(
                new ExtendedSchema(new RecordSchema(new StringSchema()), extendedValidator).cast(
                    { name: 'name', message: 'message' },
                    errorKeeper,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
            assert.ok(
                !new ExtendedSchema(new RecordSchema(new StringSchema()), extendedValidator).cast(
                    {},
                    errorKeeper,
                    false,
                ).ok,
            );
            assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                { pointer: [], details: 'Should ne not empty.' },
            ]);
        });
    });
});
