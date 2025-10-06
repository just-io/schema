import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { ErrorKeeper, defaultErrorFormatters } from '../index';

import GroupSchema from './group-schema';
import StructureSchema from './structure-schema';
import ValueSchema from './value-schema';
import StringSchema from './string-schema';
import RecordSchema from './record-schema';
import UnknownSchema from './unknown-schema';

type Group = { op: 'get'; url: string } | { op: 'add'; data: Record<string, unknown> };

describe('GroupSchema', () => {
    const groupSchema = new GroupSchema<Group, 'op', 'default'>('op', {
        get: new StructureSchema({
            op: new ValueSchema('get'),
            url: new StringSchema(),
        }),
        add: new StructureSchema({
            op: new ValueSchema('add'),
            data: new RecordSchema(new UnknownSchema()),
        }),
    });

    describe('method validate', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
            assert.ok(
                groupSchema.validate(
                    { op: 'get', url: 'example.com' },
                    'default',
                    errorKeeper,
                    false,
                ).ok,
            );
            assert.ok(
                groupSchema.validate({ op: 'add', data: { a: 12 } }, 'default', errorKeeper, false)
                    .ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
            assert.ok(
                !groupSchema.validate(
                    { op: 'delete', path: 'example.com' },
                    'default',
                    errorKeeper,
                    false,
                ).ok,
            );
            assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                { pointer: ['op'], details: 'Should be one of "get", "add".' },
            ]);
        });
    });

    describe('method cast', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
            assert.ok(
                groupSchema.cast({ op: 'get', url: 'example.com' }, 'default', errorKeeper, false)
                    .ok,
            );
            assert.ok(
                groupSchema.cast({ op: 'add', data: { a: '12' } }, 'default', errorKeeper, false)
                    .ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
            assert.ok(
                !groupSchema.cast(
                    { op: 'delete', path: 'example.com' },
                    'default',
                    errorKeeper,
                    false,
                ).ok,
            );
            assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                { pointer: ['op'], details: 'Should be one of "get", "add".' },
            ]);
        });
    });
});
