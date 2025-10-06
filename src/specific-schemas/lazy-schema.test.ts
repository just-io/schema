import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { ErrorKeeper, defaultErrorFormatters } from '../index';

import LaySchema from './lazy-schema';
import StringSchema from './string-schema';
import StructureSchema from './structure-schema';
import ArraySchema from './array-schema';
import UnionSchema from './union-schema';

type RecursiveType = {
    nodes: (RecursiveType | string)[];
};

describe('LaySchema', () => {
    const lazySchema: StructureSchema<RecursiveType, 'default'> = new StructureSchema<
        RecursiveType,
        'default'
    >({
        nodes: new ArraySchema(
            new UnionSchema<RecursiveType | string, 'default'>(
                new StringSchema(),
                new LaySchema(() => lazySchema),
            ),
        ),
    });

    describe('method validate', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
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
                    'default',
                    errorKeeper,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
            assert.ok(
                !lazySchema.validate(
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
                    'default',
                    errorKeeper,
                    false,
                ).ok,
            );
            assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                { pointer: ['nodes', '2'], group: 0, details: 'Should be "string" type.' },
                {
                    pointer: ['nodes', '2', 'nodes', '0'],
                    group: 0,
                    details: 'Should be "string" type.',
                },
                {
                    pointer: ['nodes', '2', 'nodes', '0', 'nodes', '0'],
                    group: 0,
                    details: 'Should be "string" type.',
                },
                {
                    pointer: ['nodes', '2', 'nodes', '0', 'nodes', '0'],
                    group: 1,
                    details: 'Should be "object" type.',
                },
            ]);
        });
    });

    describe('method cast', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
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
                    'default',
                    errorKeeper,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper({ default: defaultErrorFormatters });
            assert.ok(
                !lazySchema.cast(
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
                    'default',
                    errorKeeper,
                    false,
                ).ok,
            );
            assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                { pointer: ['nodes', '2'], group: 0, details: 'Should be "string" type.' },
                {
                    pointer: ['nodes', '2', 'nodes', '0'],
                    group: 0,
                    details: 'Should be "string" type.',
                },
                {
                    pointer: ['nodes', '2', 'nodes', '0', 'nodes', '0'],
                    group: 0,
                    details: 'Should be "string" type.',
                },
                {
                    pointer: ['nodes', '2', 'nodes', '0', 'nodes', '0', 'nodes'],
                    group: 1,
                    details: 'Should be existed.',
                },
            ]);
        });
    });
});
