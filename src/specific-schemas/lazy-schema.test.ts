import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import LazySchema from './lazy-schema';
import StringSchema from './string-schema';
import StructureSchema from './structure-schema';
import ArraySchema from './array-schema';
import UnionSchema from './union-schema';
import { transformToJSON } from '../heplers';
import { Pointer } from '../pointer';
import { defaultErrorFormatter } from '../error-formatter';

type RecursiveType = {
    nodes: (RecursiveType | string)[];
};

describe('LazySchema', () => {
    const lazySchema: StructureSchema<RecursiveType> = new StructureSchema<RecursiveType>({
        nodes: new ArraySchema(
            new UnionSchema<RecursiveType | string>(
                new StringSchema(),
                new LazySchema(() => lazySchema),
            ),
        ),
    });

    describe('method validate', () => {
        test('should return value result when value has right type', () => {
            assert.ok(
                lazySchema.validate(
                    {
                        nodes: [
                            {
                                nodes: [],
                            },
                            'leaf',
                            {
                                nodes: [
                                    {
                                        nodes: ['leaf'],
                                    },
                                    'leaf',
                                ],
                            },
                        ],
                    },
                    new Pointer(),
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const result = lazySchema.validate(
                {
                    nodes: [
                        {
                            nodes: [],
                        },
                        'leaf',
                        {
                            nodes: [
                                {
                                    nodes: [12],
                                },
                                'leaf',
                            ],
                        },
                    ],
                },
                new Pointer(),
                defaultErrorFormatter,
                false,
            );
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: ['nodes', '2'], group: 0, detail: 'Should be "string" type.' },
                {
                    pointer: ['nodes', '2', 'nodes', '0'],
                    group: 0,
                    detail: 'Should be "string" type.',
                },
                {
                    pointer: ['nodes', '2', 'nodes', '0', 'nodes', '0'],
                    group: 0,
                    detail: 'Should be "string" type.',
                },
                {
                    pointer: ['nodes', '2', 'nodes', '0', 'nodes', '0'],
                    group: 1,
                    detail: 'Should be "object" type.',
                },
            ]);
        });
    });

    describe('method cast', () => {
        test('should return value result when value has right type', () => {
            assert.ok(
                lazySchema.cast(
                    {
                        nodes: {
                            0: {
                                nodes: [],
                            },
                            1: 'leaf',
                            2: {
                                nodes: {
                                    0: {
                                        nodes: ['leaf'],
                                    },
                                    1: 'leaf',
                                },
                            },
                        },
                    },
                    new Pointer(),
                    defaultErrorFormatter,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const result = lazySchema.cast(
                {
                    nodes: {
                        0: {
                            nodes: [],
                        },
                        1: 'leaf',
                        2: {
                            nodes: {
                                0: {
                                    nodes: {
                                        0: {},
                                    },
                                },
                                1: 'leaf',
                            },
                        },
                    },
                },
                new Pointer(),
                defaultErrorFormatter,
                false,
            );
            assert.ok(!result.ok);
            assert.deepStrictEqual(result.error.toJSON(transformToJSON), [
                { pointer: ['nodes', '2'], group: 0, detail: 'Should be "string" type.' },
                {
                    pointer: ['nodes', '2', 'nodes', '0'],
                    group: 0,
                    detail: 'Should be "string" type.',
                },
                {
                    pointer: ['nodes', '2', 'nodes', '0', 'nodes', '0'],
                    group: 0,
                    detail: 'Should be "string" type.',
                },
                {
                    pointer: ['nodes', '2', 'nodes', '0', 'nodes', '0', 'nodes'],
                    group: 1,
                    detail: 'Should be existed.',
                },
            ]);
        });
    });
});
