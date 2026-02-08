@just-io/schema
===============

A TypeScript library for declaring schemas for validation and JSON Schema generation.

## Installation

```bash
npm install @just-io/schema
```

## Quick Start

```typescript
import { make, ErrorKeeper, defaultErrorFormatter } from '@just-io/schema';

const schemas = make<'default'>();

// Define a schema
const userSchema = schemas.structure({
    name: schemas.string(),
    age: schemas.number().minimum(0).integer(),
    email: schemas.string().regexp(/^[\w.-]+@[\w.-]+\.\w+$/),
    active: schemas.boolean(),
});

// Validate data
const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
const result = userSchema.validate({ name: 'John', age: 25, email: 'john@example.com', active: true }, errorKeeper, false);

if (result.ok) {
    console.log('Valid:', result.value);
} else {
    console.log('Errors:', errorKeeper.makeStringErrors());
}
```

## Schema Types

### Primitive Schemas

#### `string()`

Validates string values with optional constraints.

```typescript
schemas.string()                              // Any string
schemas.string(['a', 'b', 'c'])              // String enum (type narrowing)
schemas.string().enum(['a', 'b', 'c'])       // String enum
schemas.string().regexp(/pattern/)           // Regexp pattern matching
schemas.string().minLength(5)                // Minimum length
schemas.string().maxLength(100)              // Maximum length
```

#### `number()`

Validates number values with optional constraints.

```typescript
schemas.number()                             // Any number
schemas.number([1, 2, 3, 4, 5])             // Number enum (type narrowing)
schemas.number().enum([1, 2, 3])            // Number enum
schemas.number().minimum(0)                  // Minimum value
schemas.number().maximum(100)                // Maximum value
schemas.number().integer()                   // Integer only
```

#### `boolean()`

Validates boolean values.

```typescript
schemas.boolean()
```

#### `null()`

Validates null values.

```typescript
schemas.null()
```

#### `undefined()`

Validates undefined values.

```typescript
schemas.undefined()
```

#### `value()`

Validates a specific literal value.

```typescript
schemas.value('exact-string')    // Exact string
schemas.value(42)                // Exact number
schemas.value(true)              // Exact boolean
schemas.value(null)              // Exact null
```

### Composite Schemas

#### `structure()`

Validates object structures with defined fields.

```typescript
type User = {
    name: string;
    age: number;
};

schemas.structure<User>({
    name: schemas.string(),
    age: schemas.number(),
});

// With additional properties
schemas.structure({
    name: schemas.string(),
}).additionalProps(schemas.number());
```

#### `array()`

Validates arrays with item schema.

```typescript
schemas.array(schemas.string())                    // Array of strings
schemas.array(schemas.number()).minItems(1)        // At least 1 item
schemas.array(schemas.number()).maxItems(10)       // At most 10 items
schemas.array(schemas.number()).unique()           // All items must be unique
```

#### `tuple()`

Validates fixed-length arrays with specific types at each position.

```typescript
schemas.tuple(schemas.number(), schemas.string())  // [number, string]
```

#### `record()`

Validates objects with dynamic keys but uniform value types.

```typescript
schemas.record(schemas.string())    // Record<string, string>
schemas.record(schemas.number())    // Record<string, number>
```

#### `union()`

Validates values that match any of the provided schemas.

```typescript
schemas.union(schemas.number(), schemas.null())    // number | null
schemas.union(schemas.string(), schemas.number())  // string | number
```

#### `group()`

Validates discriminated unions based on a key field.

```typescript
type Action =
    | { type: 'get'; url: string }
    | { type: 'add'; data: object };

schemas.group<Action, 'type'>('type', {
    get: schemas.structure({
        type: schemas.value('get'),
        url: schemas.string(),
    }),
    add: schemas.structure({
        type: schemas.value('add'),
        data: schemas.record(schemas.unknown()),
    }),
});
```

### Modifier Schemas

#### `optional()`

Makes a schema accept undefined in addition to its base type.

```typescript
schemas.optional(schemas.number())    // number | undefined
```

#### `nullable()`

Makes a schema accept null in addition to its base type.

```typescript
schemas.nullable(schemas.number())    // number | null
```

### Advanced Schemas

#### `lazy()`

Creates schemas for recursive types.

```typescript
type TreeNode = {
    nodes: (TreeNode | string)[];
};

const treeSchema: StructureSchema<TreeNode, 'default'> = schemas.structure<TreeNode>({
    nodes: schemas.array(
        schemas.union<TreeNode | string>(
            schemas.string(),
            schemas.lazy(() => treeSchema),
        ),
    ),
});
```

#### `extended()`

Adds custom validators to existing schemas.

```typescript
function notEmpty(value: Record<string, string>, lang: 'default', errorKeeper: ErrorKeeper<'default'>): boolean {
    if (Object.keys(value).length === 0) {
        errorKeeper.push('Should not be empty.');
        return false;
    }
    return true;
}

schemas.extended(schemas.record(schemas.string()), notEmpty);
```

#### `custom()`

Creates fully custom schemas for special types.

```typescript
schemas.custom<File, 'default'>({
    validate(value, errorKeeper, useDefault) {
        if (value instanceof File) {
            return { ok: true, value };
        }
        errorKeeper.push('Should be File.');
        return { ok: false, error: true };
    },
    cast(value, errorKeeper, useDefault) {
        if (value instanceof File) {
            return { ok: true, value };
        }
        errorKeeper.push('Should be File.');
        return { ok: false, error: true };
    },
    makeJSONSchema(pointer, defs, lang) {
        return { type: 'string', format: 'binary' };
    },
});
```

#### `any()` and `unknown()`

Accepts any value without validation.

```typescript
schemas.any()
schemas.unknown()
```

## Validation Methods

### `is(value, errorKeeper?)`

Returns `true` if valid, `false` otherwise.

```typescript
if (schemas.number().is(42)) {
    // Valid
}
```

### `assert(value, errorKeeper?)`

Returns `true` if valid, throws an error otherwise.

```typescript
schemas.number().assert(42);  // Returns true
schemas.number().assert('42'); // Throws Error
```

### `check(value, errorKeeper?)`

Returns a result object with `ok` boolean.

```typescript
const result = schemas.number().check(42);
if (result.ok) {
    console.log(result.value);
}
```

### `validate(value, errorKeeper, useDefault)`

Internal validation method returning a detailed result.

```typescript
const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
const result = schema.validate(data, errorKeeper, false);

if (!result.ok) {
    console.log(errorKeeper.makeStringErrors());
    // [{ pointer: ['field'], details: 'Should be "string" type.' }]
}
```

### `cast(value, errorKeeper, useDefault)`

Validates and casts string values to their appropriate types (useful for form data).

```typescript
const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);

// String "123" is cast to number 123
schemas.number().cast('123', errorKeeper, false);

// String "true" is cast to boolean true, empty string "" to false
schemas.boolean().cast('true', errorKeeper, false);
```

## Composing from Form Data

The `compose` method can construct objects from flat key-value data like `FormData`, `URLSearchParams`, or plain objects.

```typescript
type Book = {
    name: string;
    chapters: { title: string; pages: number }[];
    tags: string[];
};

const schema = schemas.structure<Book>({
    name: schemas.string(),
    chapters: schemas.array(schemas.structure({
        title: schemas.string(),
        pages: schemas.number(),
    })),
    tags: schemas.array(schemas.string()),
});

// From URLSearchParams
const params = new URLSearchParams([
    ['name', 'My Book'],
    ['chapters/0/title', 'Chapter 1'],
    ['chapters/0/pages', '10'],
    ['tags', 'fiction'],
    ['tags', 'adventure'],
]);

const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
const result = schema.compose(params, errorKeeper, false, '/', 0);

// Also works with FormData and plain objects
```

## JSON Schema Generation

Generate JSON Schema from your schemas:

```typescript
const schema = schemas.structure({
    name: schemas.string().title({ default: 'Name' }),
    age: schemas.number().minimum(0).integer().description({ default: 'User age' }),
    active: schemas.boolean().default(false),
});

const jsonSchema = schema.generateJSONSchema('default');
// {
//     type: 'object',
//     properties: {
//         name: { type: 'string', title: 'Name' },
//         age: { type: 'integer', minimum: 0, description: 'User age' },
//         active: { type: 'boolean', defaut: false }
//     },
//     required: ['name', 'age', 'active'],
//     additionalProperties: false
// }
```

### Schema Metadata

Add metadata for JSON Schema generation:

```typescript
schemas.string()
    .title({ default: 'Field Title' })
    .description({ default: 'Field description' })
    .default('default value')
```

## Error Handling

Validation errors provide detailed information about what went wrong:

```typescript
const errorKeeper = new ErrorKeeper('default', defaultErrorFormatter);
schema.validate(invalidData, errorKeeper, false);

const errors = errorKeeper.makeStringErrors();
// [
//     { pointer: ['name'], details: 'Should be existed.' },
//     { pointer: ['age'], details: 'Should be "number" type.' },
//     { pointer: ['unknownField'], details: 'Should not be existed.' }
// ]
```

## Multi-language Support

The library supports multiple language configurations for error messages:

```typescript
const schemas = make<'en' | 'de'>();

schemas.string()
    .title({ en: 'Name', de: 'Name' })
    .description({ en: 'User name', de: 'Benutzername' });
```

## License

MIT
