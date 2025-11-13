import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { make, ErrorKeeper, defaultErrorFormatter } from './index';
import StructureSchema from './specific-schemas/structure-schema';

const schemas = make<'default'>();

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

type SimpleBook = {
    name: string;
    chapters: {
        title: string;
        pages: number;
        published: boolean;
    }[];
    tags: string[];
    available: boolean;
};

describe('Common schema methods', () => {
    describe('method is', () => {
        test('should return true when value has right type', () => {
            assert.ok(schemas.value('str').is('str'));
        });

        test('should return false when value has not right type', () => {
            assert.ok(!schemas.value('str').is(12));
        });

        describe('with Error Keeper', () => {
            test('should return true when value has right type', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(schemas.value('str').is('str', errorKeeper));
            });

            test('should return false when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(!schemas.value('str').is(12, errorKeeper));
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should be equal "str".' },
                ]);
            });
        });
    });

    describe('method assert', () => {
        test('should return true when value has right type', () => {
            assert.ok(schemas.value('str').assert('str'));
        });

        test('should throw error when value has not right type', () => {
            assert.throws(() => schemas.value('str').assert(12));
        });

        describe('with Error Keeper', () => {
            test('should return true when value has right type', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(schemas.value('str').assert('str', errorKeeper));
            });

            test('should throw error when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.throws(() => schemas.value('str').assert(12, errorKeeper));
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should be equal "str".' },
                ]);
            });
        });
    });

    describe('method check', () => {
        test('should return value result when value has right type', () => {
            assert.ok(schemas.value('str').check('str').ok);
        });

        test('should return error result when value has not right type', () => {
            assert.ok(!schemas.value('str').check(12).ok);
        });

        describe('with Error Keeper', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(schemas.value('str').check('str', errorKeeper).ok);
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                assert.ok(!schemas.value('str').check(12, errorKeeper).ok);
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: [], details: 'Should be equal "str".' },
                ]);
            });
        });
    });

    describe('method generateJSONSchema', () => {
        test('should return valid JSON schema', () => {
            const jsonSchema = schemas.number().generateJSONSchema('default');
            assert.deepStrictEqual(jsonSchema, {
                type: 'number',
            });
        });

        test('should return valid JSON schema with additional parameters', () => {
            const jsonSchema = schemas
                .number()
                .title({ default: 'Title of value' })
                .description({ default: 'Description of value' })
                .default(0)
                .generateJSONSchema('default');
            assert.deepStrictEqual(jsonSchema, {
                type: 'number',
                defaut: 0,
                title: 'Title of value',
                description: 'Description of value',
            });
        });

        const schema = schemas.structure<Book>({
            name: schemas.string().title({ default: 'Book name' }),
            genres: schemas
                .array(schemas.string<Book['genres'][number]>(['horror', 'adveture']))
                .unique(),
            published: schemas
                .boolean()
                .title({ default: 'Publishing marker' })
                .description({ default: 'Whether the book is published (true), or not (false)' })
                .default(false),
            pages: schemas.number().minimum(0).integer().title({ default: 'Count of book pages' }),
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
                                }),
                            )
                            .default(() => []),
                    ),
                }),
            }),
        });

        test('should return valid JSON schema for complex type', () => {
            const jsonSchema = schema.generateJSONSchema('default');
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

        const lazySchema: StructureSchema<RecursiveType, 'default'> =
            schemas.structure<RecursiveType>({
                nodes: schemas.array(
                    schemas.union<RecursiveType | string>(
                        schemas.string(),
                        schemas.lazy(() => lazySchema),
                    ),
                ),
            });

        test('should return valid JSON schema for lazy type', () => {
            const jsonSchema = lazySchema.generateJSONSchema('default');
            assert.deepStrictEqual(jsonSchema, {
                $defs: {
                    'nodes/item/1': {
                        additionalProperties: false,
                        properties: {
                            nodes: {
                                items: {
                                    oneOf: [
                                        {
                                            type: 'string',
                                        },
                                        {
                                            $ref: '#/$defs/nodes/item/1',
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
                                    $ref: '#/$defs/nodes/item/1',
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

    describe('method compose', () => {
        const schema = schemas.structure<SimpleBook>({
            name: schemas.string(),
            chapters: schemas.array(
                schemas.structure<SimpleBook['chapters'][number]>({
                    title: schemas.string(),
                    pages: schemas.number().minimum(0).integer(),
                    published: schemas.boolean(),
                }),
            ),
            tags: schemas.array(schemas.string()).unique(),
            available: schemas.boolean(),
        });

        describe('with Record', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                const result = schema.compose(
                    {
                        name: 'The book',
                        'chapters/1/title': 'First',
                        'chapters/1/pages': '14',
                        'chapters/1/published': 'published',
                        'chapters/0/title': 'Second',
                        'chapters/0/pages': '23',
                        'chapters/0/published': '',
                        tags: ['horror', 'adventure'],
                        available: 'available',
                    },
                    errorKeeper,
                    false,
                    '/',
                    0,
                );
                assert.deepStrictEqual(result, {
                    ok: true,
                    value: {
                        name: 'The book',
                        chapters: [
                            {
                                title: 'Second',
                                pages: 23,
                                published: false,
                            },
                            {
                                title: 'First',
                                pages: 14,
                                published: true,
                            },
                        ],
                        tags: ['horror', 'adventure'],
                        available: true,
                    },
                });
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                const result = schema.compose(
                    {
                        title: 'The book',
                        'chapters/1/title': 'First',
                        'chapters/1/pages': '14',
                        'chapters/1/published': 'published',
                        'chapters/2/title': 'Second',
                        'chapters/2/pages': '23',
                        'chapters/2/published': '',
                        'tags/check': ['horror', 'adveture'],
                    },
                    errorKeeper,
                    false,
                    '/',
                    0,
                );
                assert.ok(!result.ok);
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: ['name'], details: 'Should be existed.' },
                    { pointer: ['chapters', '0'], details: 'Should be "object" type.' },
                    { pointer: ['available'], details: 'Should be existed.' },
                    { pointer: ['title'], details: 'Should not be existed.' },
                ]);
            });
        });

        describe('with URLSearchParams', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                const urlSearchParams = new URLSearchParams([
                    ['name', 'The book'],
                    ['chapters/1/title', 'First'],
                    ['chapters/1/pages', '14'],
                    ['chapters/1/published', 'published'],
                    ['chapters/0/title', 'Second'],
                    ['chapters/0/pages', '23'],
                    ['chapters/0/published', ''],
                    ['tags', 'horror'],
                    ['tags', 'adventure'],
                    ['available', 'available'],
                ]);
                const result = schema.compose(urlSearchParams, errorKeeper, false, '/', 0);
                assert.deepStrictEqual(result, {
                    ok: true,
                    value: {
                        name: 'The book',
                        chapters: [
                            {
                                title: 'Second',
                                pages: 23,
                                published: false,
                            },
                            {
                                title: 'First',
                                pages: 14,
                                published: true,
                            },
                        ],
                        tags: ['horror', 'adventure'],
                        available: true,
                    },
                });
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                const urlSearchParams = new URLSearchParams([
                    ['title', 'The book'],
                    ['chapters/1/title', 'First'],
                    ['chapters/1/pages', '14'],
                    ['chapters/1/published', 'published'],
                    ['chapters/2/title', 'Second'],
                    ['chapters/2/pages', '23'],
                    ['chapters/2/published', ''],
                    ['tags/check', 'horror'],
                    ['tags/check', 'adventure'],
                ]);
                const result = schema.compose(urlSearchParams, errorKeeper, false, '/', 0);
                assert.ok(!result.ok);
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: ['name'], details: 'Should be existed.' },
                    { pointer: ['chapters', '0'], details: 'Should be "object" type.' },
                    { pointer: ['available'], details: 'Should be existed.' },
                    { pointer: ['title'], details: 'Should not be existed.' },
                ]);
            });
        });

        describe('with FormData', () => {
            test('should return value result when value has right type', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                const formData = new FormData();
                formData.append('name', 'The book');
                formData.append('chapters/1/title', 'First');
                formData.append('chapters/1/pages', '14');
                formData.append('chapters/1/published', 'published');
                formData.append('chapters/0/title', 'Second');
                formData.append('chapters/0/pages', '23');
                formData.append('chapters/0/published', '');
                formData.append('tags', 'horror');
                formData.append('tags', 'adventure');
                formData.append('available', 'available');
                const result = schema.compose(formData, errorKeeper, false, '/', 0);
                assert.deepStrictEqual(result, {
                    ok: true,
                    value: {
                        name: 'The book',
                        chapters: [
                            {
                                title: 'Second',
                                pages: 23,
                                published: false,
                            },
                            {
                                title: 'First',
                                pages: 14,
                                published: true,
                            },
                        ],
                        tags: ['horror', 'adventure'],
                        available: true,
                    },
                });
            });

            test('should return error result when value has not right type and has errors', () => {
                const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
                const formData = new FormData();
                formData.append('title', 'The book');
                formData.append('chapters/1/title', 'First');
                formData.append('chapters/1/pages', '14');
                formData.append('chapters/1/published', 'published');
                formData.append('chapters/2/title', 'Second');
                formData.append('chapters/2/pages', '23');
                formData.append('chapters/2/published', '');
                formData.append('tags/check', 'horror');
                formData.append('tags/check', 'adventure');
                const result = schema.compose(formData, errorKeeper, false, '/', 0);
                assert.ok(!result.ok);
                assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                    { pointer: ['name'], details: 'Should be existed.' },
                    { pointer: ['chapters', '0'], details: 'Should be "object" type.' },
                    { pointer: ['available'], details: 'Should be existed.' },
                    { pointer: ['title'], details: 'Should not be existed.' },
                ]);
            });
        });
    });
});

type RecursiveType = {
    nodes: (RecursiveType | string)[];
};

type Incoming = {
    data: {
        id: string;
        type: string;
        attributes: Record<string, unknown>[];
        relationships?: Record<string, unknown>;
    };
};

describe('Complex schema using', () => {
    const schema = schemas.structure<Incoming>({
        data: schemas.structure<Incoming['data']>({
            id: schemas.string(),
            type: schemas.string(),
            attributes: schemas.array(schemas.record(schemas.string())),
            relationships: schemas.optional(schemas.record(schemas.string())),
        }),
    });

    describe('method validate', () => {
        test('should return value result when value has right type', () => {
            const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
            assert.ok(
                schema.validate(
                    { data: { id: 'none', type: '12', attributes: [{ a: '1' }, { b: 'c' }] } },
                    errorKeeper,
                    false,
                ).ok,
            );
        });

        test('should return error result when value has not right type and has errors', () => {
            const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
            assert.ok(
                !schema.validate(
                    { data: { test: '12', attributes: [1, {}, 12] } },
                    errorKeeper,
                    false,
                ).ok,
            );
            assert.deepStrictEqual(errorKeeper.makeStringErrors(), [
                { pointer: ['data', 'id'], details: 'Should be existed.' },
                { pointer: ['data', 'type'], details: 'Should be existed.' },
                { pointer: ['data', 'attributes', '0'], details: 'Should be "object" type.' },
                { pointer: ['data', 'attributes', '2'], details: 'Should be "object" type.' },
                { pointer: ['data', 'test'], details: 'Should not be existed.' },
            ]);
        });
    });
});
