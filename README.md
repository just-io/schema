Validator
=========

This package can help you to validate your structures.

## Installation

This is a Typescript module so you need to use Typescript.

## Documentation

### Types

#### Type `Errors`

Type `Errors<T>` describes mapping an interface to an interface with same interface where all values are string.

This type is for errors.

```typescript
interface ComplexStructure {
    prop1: string;
    prop2: number[];
    prop3: {
        subProp1: number[];
        subProp2: {
            subSubProp1: string;
        }[];
    };
}

type ComplexStructureErrors = Errors<ComplexStructure>;
/*
type ComplexStructureErrors = {
    prop1: string;
    prop2: string[];
    prop3: {
        subProp1: string[];
        subProp2: {
            subSubProp1: string;
        }[];
    };
}
*/
```

#### Type `ValidatorHandler`

Type `ValidatorHandler<T, S>` describes handler for validating a field of the structure.

It is function `(value: T, structure: S, indexes: number[]) => string` where `value` containing current value of property which is validated, `structure` - full structure which is validated and `indexes` - array of indexes of positions in arrays this value. Example:
> `const str = { a: [{ b: [1, 2, 3] }, { b: [4, 5] }]};`  
> value 4 has indexes = `[1, 0]`, where 1 is position in the array `[{ b: [1, 2, 3] }, { b: [4, 5] }]`, 0 is position in the array `[4, 5]`

#### Type `StructureValidatorHandler`

Type `StructureValidatorHandler<S>` describes handler for validating the full structure.

#### Type `Validators`

Type `Validators<T, S>` describes mapping an interface to an interface with same interface where all values can be `ValidatorHandler<T, S>` or `undefined`.

This type is for validators.

If value has type array validator will be not array.

```typescript
interface ComplexStructure {
    prop1: string;
    prop2: number[];
    prop3: {
        subProp1: number[];
        subProp2: {
            subSubProp1: string;
        }[];
    };
}

type ComplexStructureValidators = Validators<ComplexStructure, ComplexStructure>;
/*
type ComplexStructureValidators = {
    prop1: ValidatorHandler<string, ComplexStructure>;
    prop2: ValidatorHandler<number, ComplexStructure>;
    prop3: {
        subProp1: ValidatorHandler<number, ComplexStructure>;
        subProp2: {
            subSubProp1: ValidatorHandler<string, ComplexStructure>;
        };
    };
}
*/
```

#### Type `StructureErrors`

Type `StructureErrors<V extends string>` describes errors of the full structure.

#### Type `ComplexErrors`

Type `ComplexErrors<S, V extends string>` describes errors of fields and errors of the full structure.

### Class `Validator`

Class `Validator<T, V extends string = ''>` needs for validating a structures.

#### Constructor

```typescript
const aValidator = new Validator<T, V extends string = ''>(
    validators: Validators<T, T> = {},
    structureValidators: Record<V, StructureValidatorHandler<T>> = {} as Record<V, StructureValidatorHandler<T>>,
);
```

Create validator, where `validators` is object with validator handlers, `structureValidators` is object with structure validator handlers.

#### `aValidator.validateFields`

`aValidator.validateFields(structure: T): Errors<T>` - return field errors  for `structure`.

#### `aValidator.validateStructure`

`aValidator.validateStructure(structure: T): StructureErrors<T>` - return structure errors for `structure`.

#### `aValidator.validate`

`aValidator.validate(structure: T): ComplexErrors<T>` - return field errors and structure errors  for `structure`.

#### `aValidator.hasFieldsErrors`

`aValidator.hasFieldsErrors(errors: Errors<T>): boolean` - return `true` if field errors has one or more errors.

#### `aValidator.hasStructureErrors`

`aValidator.hasStructureErrors(errors: StructureErrors<V>): boolean` - return `true` if structure errors has one or more errors.

#### `aValidator.hasStructureErrors`

`aValidator.hasErrors(errors: ComplexErrors<T, V>): boolean` - return `true` if field errors or structure errors has one or more errors.

### Function `combo`

Function `combo<T, S>(...funcs: ValidatorHandler<T, S>[]): ValidatorHandler<T, S>` - return new function which executes each functions from `funcs` while not receive first error.

## Examples

```typescript
import Validator, { combo } from 'validator';

interface User {
    name: string;
    age: number;
    bills: number[];
    parents: {
        name: string;
    }[];
}

const aValidator = new Validator<User, 'billsError'>({
    name: (value) => (value === '' ? 'Name must be' : ''),
    age: (value) => (value < 18 || value > 100 ? 'Age must be corrected' : ''),
    bills: (value, structure, indexes) => (structure.bills.indexOf(value) !== indexes[0]
        ? 'Bill must be unique'
        : ''
    ),
    parents: {
        name: combo(
            (value) => (value === '' ? 'Name must be' : ''),
            (value, structure, indexes) => (structure.parents.findIndex((v) => v.name === value) !== indexes[0]
                ? 'Name must be unique'
                : ''
            )
        )
    },
}, {
    billsError: (structure) => (structure.bills.length > 4 ? 'Bills must be less than 4' : ''),
});

const errors = aValidator.validate({
    name: '',
    age: 200,
    bills: [12, 32, 42, 12, 23],
    parents: [
        {
            name: 'mom',
        },
        {
            name: 'mom',
        }
    ]
});

/*
{
    "fields": {
        "name": "Name must be",
        "age": "Age must be corrected",
        "bills": [
            "",
            "",
            "",
            "Bill must be unique",
            ""
        ],
        "parents": [
            {
                "name": ""
            },
            {
                "name": "Name must be unique"
            }
        ]
    },
    "structure": {
        "billsError": "Bills must be less than 4"
    }
}
*/

```