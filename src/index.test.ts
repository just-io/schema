import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { schemas } from './index';
import { ErrorKeeper } from './error-keeper';
import StructureSchema from './specific-schemas/structure-schema';

describe('schemas.value', () => {
    test('match', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(schemas.value('str').is('str', errorKeeper));
    });

    test('not match', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(!schemas.value('str').is(12, errorKeeper));
        assert.deepStrictEqual(errorKeeper.makeStringErrors(), [{ pointer: [], details: 'Should be equal "str".' }]);
    });
});

describe('schemas.string', () => {
    test('match', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(schemas.string().is('string', errorKeeper));
    });

    test('not match', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(!schemas.string().is(12, errorKeeper));
        assert.deepStrictEqual(errorKeeper.makeStringErrors(), [{ pointer: [], details: 'Should be "string" type.' }]);
    });

    test('match regexp', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(
            schemas
                .string()
                .regexp(/string/)
                .is('string', errorKeeper)
        );
    });

    test('not match regexp', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(
            !schemas
                .string()
                .regexp(/string/)
                .is('strung', errorKeeper)
        );
        assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
            { pointer: [], details: 'Should match regexp "string".' },
        ]);
    });

    test('match enum', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(schemas.string().enum(['string', 'str']).is('string', errorKeeper));
    });

    test('not match enum', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(!schemas.string().enum(['string', 'str']).is('strung', errorKeeper));
        assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
            { pointer: [], details: 'Should be included in enum of values: "string", "str".' },
        ]);
    });

    test('match max length', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(schemas.string().maxLength(2).is('st', errorKeeper));
    });

    test('not match max length', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(!schemas.string().maxLength(2).is('str', errorKeeper));
        assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
            { pointer: [], details: 'Should contain less than or equal 2 symbols.' },
        ]);
    });

    test('match min length', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(schemas.string().minLength(2).is('st', errorKeeper));
    });

    test('not match min length', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(!schemas.string().minLength(2).is('s', errorKeeper));
        assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
            { pointer: [], details: 'Should contain more than or equal 2 symbols.' },
        ]);
    });
});

describe('schemas.number', () => {
    test('match', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(schemas.number().is(1234, errorKeeper));
    });

    test('not match', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(!schemas.number().is('1234', errorKeeper));
        assert.deepStrictEqual(errorKeeper.makeStringErrors(), [{ pointer: [], details: 'Should be "number" type.' }]);
    });

    test('match enum', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(schemas.number().enum([1, 2, 3]).is(1, errorKeeper));
    });

    test('not match enum', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(!schemas.number().enum([1, 2, 3]).is(0, errorKeeper));
        assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
            { pointer: [], details: 'Should be included in enum of values: 1, 2, 3.' },
        ]);
    });

    test('match minimum', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(schemas.number().minimum(2).is(2, errorKeeper));
    });

    test('not match minimum', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(!schemas.number().minimum(2).is(1, errorKeeper));
        assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
            { pointer: [], details: 'Should be more than or equal 2.' },
        ]);
    });

    test('match maximum', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(schemas.number().maximum(2).is(2, errorKeeper));
    });

    test('not match maximum', () => {
        const errorKeeper = new ErrorKeeper();

        assert.ok(!schemas.number().maximum(2).is(3, errorKeeper));
        assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
            { pointer: [], details: 'Should be less than or equal 2.' },
        ]);
    });

    test('match type integer', () => {
        const errorKeeper = new ErrorKeeper();

        assert.ok(schemas.number().integer().is(2, errorKeeper));
    });

    test('not match type integer', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(!schemas.number().integer().is(3.1, errorKeeper));
        assert.deepStrictEqual(errorKeeper.makeStringErrors(), [{ pointer: [], details: 'Should be integer value.' }]);
    });
});

describe('schemas.boolean', () => {
    test('match', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(schemas.boolean().is(true, errorKeeper));
    });

    test('not match', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(!schemas.boolean().is('1234', errorKeeper));
        assert.deepStrictEqual(errorKeeper.makeStringErrors(), [{ pointer: [], details: 'Should be "boolean" type.' }]);
    });
});

describe('schemas.null', () => {
    test('match', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(schemas.null().is(null, errorKeeper));
    });

    test('not match', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(!schemas.null().is('1234', errorKeeper));
        assert.deepStrictEqual(errorKeeper.makeStringErrors(), [{ pointer: [], details: 'Should be "null" type.' }]);
    });
});

describe('schemas.undefined', () => {
    test('match', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(schemas.undefined().is(undefined, errorKeeper));
    });

    test('not match', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(!schemas.undefined().is('1234', errorKeeper));
        assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
            { pointer: [], details: 'Should be "undefined" type.' },
        ]);
    });
});

describe('schemas.union', () => {
    test('match', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(schemas.union(schemas.number(), schemas.null()).is(123, errorKeeper));
        assert.ok(schemas.union(schemas.number(), schemas.null()).is(null, errorKeeper));
    });

    test('not match', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(!schemas.union(schemas.number(), schemas.null()).is('1234', errorKeeper));
        assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
            { pointer: [], group: 0, details: 'Should be "number" type.' },
            { pointer: [], group: 1, details: 'Should be "null" type.' },
        ]);
    });
});

describe('schemas.structure', () => {
    test('match', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(
            schemas
                .structure({ name: schemas.string(), count: schemas.number() })
                .is({ name: 'name', count: 12 }, errorKeeper)
        );
    });

    test('not match', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(!schemas.structure({ name: schemas.string(), count: schemas.number() }).is(null, errorKeeper));
        assert.deepStrictEqual(errorKeeper.makeStringErrors(), [{ pointer: [], details: 'Should be "object" type.' }]);
    });

    test('not match property', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(
            !schemas
                .structure({ name: schemas.string(), count: schemas.number() })
                .is({ prefix: 'name', count: '12' }, errorKeeper)
        );
        assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
            { pointer: ['name'], details: 'Should be existed.' },
            { pointer: ['count'], details: 'Should be "number" type.' },
            { pointer: ['prefix'], details: 'Should not be existed.' },
        ]);
    });
});

describe('schemas.optional', () => {
    test('match', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(schemas.optional(schemas.number()).is(123, errorKeeper));
        assert.ok(schemas.optional(schemas.number()).is(undefined, errorKeeper));
    });

    test('not match', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(!schemas.optional(schemas.number()).is('1234', errorKeeper));
        assert.deepStrictEqual(errorKeeper.makeStringErrors(), [{ pointer: [], details: 'Should be "number" type.' }]);
    });
});

type Group = { op: 'get'; url: string } | { op: 'add'; data: Record<string, unknown> };

describe('schemas.group', () => {
    const groupSchema = schemas.group<Group, 'op'>('op', {
        get: schemas.structure({
            op: schemas.value('get'),
            url: schemas.string(),
        }),
        add: schemas.structure({
            op: schemas.value('add'),
            data: schemas.record(schemas.unknown()),
        }),
    });

    test('match', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(groupSchema.is({ op: 'get', url: 'example.com' }, errorKeeper));
        assert.ok(groupSchema.is({ op: 'add', data: { a: 12 } }, errorKeeper));
    });

    test('not match', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(!groupSchema.is({ op: 'delete', path: 'example.com' }, errorKeeper));
        assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
            { pointer: ['op'], details: 'Should be one of "get", "add".' },
        ]);
    });
});

describe('schemas.array', () => {
    test('match', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(schemas.array(schemas.number()).is([1, 2, 3], errorKeeper));
    });

    test('not match', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(!schemas.array(schemas.number()).is(null, errorKeeper));
        assert.deepStrictEqual(errorKeeper.makeStringErrors(), [{ pointer: [], details: 'Should be "array" type.' }]);
    });

    test('not match item', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(!schemas.array(schemas.number()).is([1, 'name'], errorKeeper));
        assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
            { pointer: ['1'], details: 'Should be "number" type.' },
        ]);
    });

    test('match min items', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(schemas.array(schemas.number()).maxItems(3).is([1, 2, 3], errorKeeper));
    });

    test('not match min items', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(!schemas.array(schemas.number()).maxItems(3).is([1, 2], errorKeeper));
        assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
            { pointer: [], details: 'Should contain more than or equal 3 items.' },
        ]);
    });

    test('match max items', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(schemas.array(schemas.number()).minItems(3).is([1, 2, 3], errorKeeper));
    });

    test('not match max items', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(!schemas.array(schemas.number()).minItems(3).is([1, 2, 3, 4], errorKeeper));
        assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
            { pointer: [], details: 'Should contain less than or equal 3 items.' },
        ]);
    });

    test('match unique', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(schemas.array(schemas.number()).unique().is([1, 2, 3], errorKeeper));
    });

    test('not match unique', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(!schemas.array(schemas.number()).unique().is([1, 2, 3, 1], errorKeeper));
        assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
            { pointer: [], details: 'All items should be unique.' },
        ]);
    });
});

describe('schemas.tuple', () => {
    test('match', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(schemas.tuple<[number, string]>(schemas.number(), schemas.string()).is([12, 'name'], errorKeeper));
    });

    test('not match', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(!schemas.tuple<[number, string]>(schemas.number(), schemas.string()).is(['name', 12], errorKeeper));
        assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
            { pointer: ['0'], details: 'Should be "number" type.' },
            { pointer: ['1'], details: 'Should be "string" type.' },
        ]);
    });
});

describe('schemas.record', () => {
    test('match', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(schemas.record(schemas.string()).is({ name: 'name', message: 'message' }, errorKeeper));
    });

    test('not match', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(!schemas.record(schemas.string()).is({ name: 'name', age: 12 }, errorKeeper));
        assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
            { pointer: ['age'], details: 'Should be "string" type.' },
        ]);
    });
});

describe('schemas.extended', () => {
    function extendedValidator(value: Record<string, string>, innerErrorKeeper: ErrorKeeper): boolean {
        if (Object.keys(value).length === 0) {
            innerErrorKeeper.push('Should ne not empty.');
            return false;
        }
        return true;
    }

    test('match', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(
            schemas
                .extended(schemas.record(schemas.string()), extendedValidator)
                .is({ name: 'name', message: 'message' }, errorKeeper)
        );
    });

    test('not match', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(!schemas.extended(schemas.record(schemas.string()), extendedValidator).is({}, errorKeeper));
        assert.deepStrictEqual(errorKeeper.makeStringErrors(), [{ pointer: [], details: 'Should ne not empty.' }]);
    });
});

type RecursiveType = {
    nodes: (RecursiveType | string)[];
};

describe('schemas.recursive', () => {
    const recursiveSchema: StructureSchema<RecursiveType> = schemas.structure<RecursiveType>({
        nodes: schemas.array(schemas.union<RecursiveType | string>(schemas.string(), () => recursiveSchema)),
    });

    test('match', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(
            recursiveSchema.is(
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
                errorKeeper
            )
        );
    });

    test('not match', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(
            !recursiveSchema.is(
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
                errorKeeper
            )
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

type Incoming = {
    data: {
        id: string;
        type: string;
        attributes: Record<string, unknown>[];
        relationships?: Record<string, unknown>;
    };
};

describe('schemas complex', () => {
    const schema = schemas.structure<Incoming>({
        data: schemas.structure<Incoming['data']>({
            id: schemas.string(),
            type: schemas.string(),
            attributes: schemas.array(schemas.record(schemas.string())),
            relationships: schemas.optional(schemas.record(schemas.string())),
        }),
    });

    test('match', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(schema.is({ data: { id: 'none', type: '12', attributes: [{ a: '1' }, { b: 'c' }] } }, errorKeeper));
    });

    test('not match', () => {
        const errorKeeper = new ErrorKeeper();
        assert.ok(!schema.is({ data: { test: '12', attributes: [1, {}, 12] } }, errorKeeper));
        assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
            { pointer: ['data', 'id'], details: 'Should be existed.' },
            { pointer: ['data', 'type'], details: 'Should be existed.' },
            { pointer: ['data', 'attributes', '0'], details: 'Should be "object" type.' },
            { pointer: ['data', 'attributes', '2'], details: 'Should be "object" type.' },
            { pointer: ['data', 'test'], details: 'Should not be existed.' },
        ]);
    });
});

type Book = {
    name: string;
    genres: ('horror' | 'adveture')[];
    published: boolean;
    pages: number;
    rating: 1 | 2 | 3 | 4 | 5;
    subtype:
        | {
              type: 'novel';
          }
        | {
              type: 'story';
              magazines?: {
                  name: string;
              }[];
          };
};

describe('schemas.generateJSONSchema', () => {
    test('match', () => {
        const jsonSchema = schemas.number().generateJSONSchema();
        assert.deepStrictEqual(jsonSchema, {
            type: 'number',
        });
    });

    test('match with additional', () => {
        const jsonSchema = schemas
            .number()
            .title('Title of value')
            .description('Description of value')
            .default(0)
            .generateJSONSchema();
        assert.deepStrictEqual(jsonSchema, {
            type: 'number',
            defaut: 0,
            title: 'Title of value',
            description: 'Description of value',
        });
    });

    const schema = schemas.structure<Book>({
        name: schemas.string().title('Book name'),
        genres: schemas.array(schemas.string<Book['genres'][number]>(['horror', 'adveture'])).unique(),
        published: schemas
            .boolean()
            .title('Publishing marker')
            .description('Whether the book is published (true), or not (false)')
            .default(false),
        pages: schemas
            .number()
            .minimum(0)
            .integer()
            .title(() => 'Count of book pages'),
        rating: schemas.number<Book['rating']>([1, 2, 3, 4, 5]),
        subtype: schemas.group('type', {
            novel: schemas.structure({
                type: schemas.value('novel'),
            }),
            story: schemas.structure({
                type: schemas.value('story'),
                magazines: schemas.optional(
                    schemas
                        .array(
                            schemas.structure({
                                name: schemas.string(),
                            })
                        )
                        .default(() => [])
                ),
            }),
        }),
    });

    test('match complex', () => {
        const jsonSchema = schema.generateJSONSchema();
        assert.deepStrictEqual(jsonSchema, {
            additionalProperties: false,
            properties: {
                genres: {
                    items: {
                        enum: ['horror', 'adveture'],
                        type: 'string',
                    },
                    type: 'array',
                    uniqueItems: true,
                },
                name: {
                    type: 'string',
                    title: 'Book name',
                },
                pages: {
                    title: 'Count of book pages',
                    minimum: 0,
                    type: 'integer',
                },
                published: {
                    type: 'boolean',
                    defaut: false,
                    title: 'Publishing marker',
                    description: 'Whether the book is published (true), or not (false)',
                },
                rating: {
                    enum: [1, 2, 3, 4, 5],
                    type: 'number',
                },
                subtype: {
                    oneOf: [
                        {
                            additionalProperties: false,
                            properties: {
                                type: {
                                    const: 'novel',
                                    type: 'string',
                                },
                            },
                            required: ['type'],
                            type: 'object',
                        },
                        {
                            additionalProperties: false,
                            properties: {
                                magazines: {
                                    items: {
                                        additionalProperties: false,
                                        properties: {
                                            name: {
                                                type: 'string',
                                            },
                                        },
                                        required: ['name'],
                                        type: 'object',
                                    },
                                    type: 'array',
                                    defaut: [],
                                },
                                type: {
                                    const: 'story',
                                    type: 'string',
                                },
                            },
                            required: ['type'],
                            type: 'object',
                        },
                    ],
                },
            },
            required: ['name', 'genres', 'published', 'pages', 'rating', 'subtype'],
            type: 'object',
        });
    });

    const recursiveSchema: StructureSchema<RecursiveType> = schemas.structure<RecursiveType>({
        nodes: schemas.array(schemas.union<RecursiveType | string>(schemas.string(), () => recursiveSchema)),
    });

    test('match recursive', () => {
        const jsonSchema = recursiveSchema.generateJSONSchema();
        assert.deepStrictEqual(jsonSchema, {
            $defs: {
                'nodes/1': {
                    additionalProperties: false,
                    properties: {
                        nodes: {
                            items: {
                                oneOf: [
                                    {
                                        type: 'string',
                                    },
                                    {
                                        $ref: '#/$defs/nodes/1',
                                    },
                                ],
                            },
                            type: 'array',
                        },
                    },
                    required: ['nodes'],
                    type: 'object',
                },
            },
            additionalProperties: false,
            properties: {
                nodes: {
                    items: {
                        oneOf: [
                            {
                                type: 'string',
                            },
                            {
                                $ref: '#/$defs/nodes/1',
                            },
                        ],
                    },
                    type: 'array',
                },
            },
            required: ['nodes'],
            type: 'object',
        });
    });
});
