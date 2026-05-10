import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import GroupSchema from './group-schema';
import StructureSchema from './structure-schema';
import ValueSchema from './value-schema';
import StringSchema from './string-schema';
import RecordSchema from './record-schema';
import UnknownSchema from './unknown-schema';
import { transformToJSON } from '../heplers';
import { defaultErrorFormatter } from '../error-formatter';
import { ErrorKeeper } from '../error-keeper';

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
            const errorKeeper = new ErrorKeeper();
            assert.ok(
                groupSchema.validate(
                    { op: 'get', url: 'example.com' },
                    errorKeeper,
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
            assert.ok(
                groupSchema.validate(
                    { op: 'add', data: { a: 12 } },
                    errorKeeper,
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper();
            const result = groupSchema.validate(
                { op: 'delete', path: 'example.com' },
                errorKeeper,
                defaultErrorFormatter,
                false,
            );
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: ['op'], detail: 'Should be one of "get", "add".' },
            ]);
        });
    });

    describe('method cast', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper();
            assert.ok(
                groupSchema.cast(
                    { op: 'get', url: 'example.com' },
                    errorKeeper,
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
            assert.ok(
                groupSchema.cast(
                    { op: 'add', data: { a: '12' } },
                    errorKeeper,
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper();
            const result = groupSchema.cast(
                { op: 'delete', path: 'example.com' },
                errorKeeper,
                defaultErrorFormatter,
                false,
            );
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: ['op'], detail: 'Should be one of "get", "add".' },
            ]);
        });
    });
});
