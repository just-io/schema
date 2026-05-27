import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import StructureSchema from './structure-schema';
import StringSchema from './string-schema';
import NumberSchema from './number-schema';
import OptionalSchema from './optional-schema';
import { transformToJSON } from '../heplers';
import { Pointer } from '../pointer';
import { defaultErrorFormatter } from '../error-formatter';

describe('StructureSchema', () => {
    describe('method validate', () => {
        test('should return value result when value has right type', () => {
            assert.ok(
                new StructureSchema({
                    name: new StringSchema(),
                    count: new NumberSchema(),
                }).validate(
                    { name: 'name', count: 12 },
                    new Pointer(),
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
        });

        test('should return value result when value has right type with additional properties', () => {
            assert.ok(
                new StructureSchema({
                    name: new StringSchema(),
                    count: new NumberSchema(),
                })
                    .additionalProps(new NumberSchema())
                    .validate(
                        { name: 'name', count: 12, total: 27 },
                        new Pointer(),
                        defaultErrorFormatter,
                        false,
                    ).ok,
            );
        });

        test('should return value result when value has right type with optional properties', () => {
            assert.ok(
                new StructureSchema({
                    name: new StringSchema(),
                    count: new OptionalSchema(new NumberSchema()),
                }).validate({ name: 'name' }, new Pointer(), defaultErrorFormatter, false).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const result = new StructureSchema({
                name: new StringSchema(),
                count: new NumberSchema(),
            }).validate(null, new Pointer(), defaultErrorFormatter, false);
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: [], detail: 'Should be "object" type.' },
            ]);
        });

        test('should return error result when value contains wrong keys and does not contain right keys and has errors', () => {
            const result = new StructureSchema({
                name: new StringSchema(),
                count: new NumberSchema(),
            }).validate(
                { prefix: 'name', count: '12' },
                new Pointer(),
                defaultErrorFormatter,
                false,
            );
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: ['name'], detail: 'Should be existed.' },
                { pointer: ['count'], detail: 'Should be "number" type.' },
                { pointer: ['prefix'], detail: 'Should not be existed.' },
            ]);
        });

        test('should return error result when value contains wrong additional properties', () => {
            const result = new StructureSchema({
                name: new StringSchema(),
                count: new NumberSchema(),
            })
                .additionalProps(new NumberSchema())
                .validate(
                    { name: 'name', count: 12, total: '27 pages' },
                    new Pointer(),
                    defaultErrorFormatter,
                    false,
                );
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: ['total'], detail: 'Should be "number" type.' },
            ]);
        });
    });

    describe('method cast', () => {
        test('should return value result when value has right type', () => {
            assert.ok(
                new StructureSchema({ name: new StringSchema(), count: new NumberSchema() }).cast(
                    { name: 'name', count: '12' },
                    new Pointer(),
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
        });

        test('should return value result when value has right type with additional properties', () => {
            assert.ok(
                new StructureSchema({
                    name: new StringSchema(),
                    count: new NumberSchema(),
                })
                    .additionalProps(new NumberSchema())
                    .cast(
                        { name: 'name', count: '12', total: '27' },
                        new Pointer(),
                        defaultErrorFormatter,
                        false,
                    ).ok,
            );
        });

        test('should return value result when value has right type with optional properties', () => {
            assert.ok(
                new StructureSchema({
                    name: new StringSchema(),
                    count: new OptionalSchema(new NumberSchema()),
                }).cast({ name: 'name' }, new Pointer(), defaultErrorFormatter, false).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const result = new StructureSchema({
                name: new StringSchema(),
                count: new NumberSchema(),
            }).cast('', new Pointer(), defaultErrorFormatter, false);
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: [], detail: 'Should be "object" type.' },
            ]);
        });

        test('should return error result when value contains wrong keys and does not contain right keys and has errors', () => {
            const result = new StructureSchema({
                name: new StringSchema(),
                count: new NumberSchema(),
            }).cast({ prefix: 'name', count: '' }, new Pointer(), defaultErrorFormatter, false);
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: ['name'], detail: 'Should be existed.' },
                { pointer: ['count'], detail: 'Should be "number" type.' },
                { pointer: ['prefix'], detail: 'Should not be existed.' },
            ]);
        });

        test('should return error result when value contains wrong additional properties', () => {
            const result = new StructureSchema({
                name: new StringSchema(),
                count: new NumberSchema(),
            })
                .additionalProps(new NumberSchema())
                .cast(
                    { name: 'name', count: '12', total: '27 pages' },
                    new Pointer(),
                    defaultErrorFormatter,
                    false,
                );
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: ['total'], detail: 'Should be "number" type.' },
            ]);
        });
    });
});
