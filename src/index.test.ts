import Validator, { combo } from '.';

interface SimpleStructure {
    prop1: string;
    prop2: number;
}

interface SimpleStructureWithPartialField {
    prop1: string;
    prop2?: number;
}

interface SimpleStructureWithArrays {
    prop1: string;
    prop2: number;
    prop3: number[];
}

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

interface ComplexStructureWithArrayInArray {
    prop1: string;
    prop2: number[];
    prop3: {
        subProp1: number[];
        subProp2: {
            subSubProp1: string[];
        }[];
    };
}

describe('Validator.validateFields', () => {
    it('Validate fields of a simple structure without validators', () => {
        const simpleStructure: SimpleStructure = {
            prop1: '1',
            prop2: 2,
        };
        const validator = new Validator<SimpleStructure>();
        expect(validator.validateFields(simpleStructure)).toEqual({ prop1: '', prop2: '' });
    });

    it('Validate fields of a simple structure with one validator', () => {
        const simpleStructure: SimpleStructure = {
            prop1: '1',
            prop2: 2,
        };
        const validator = new Validator<SimpleStructure>({
            prop1: (value) => (value === '1' ? 'error' : ''),
        });
        expect(validator.validateFields(simpleStructure)).toEqual({ prop1: 'error', prop2: '' });
    });

    it('Validate fields of a simple structure with validators', () => {
        const simpleStructure: SimpleStructure = {
            prop1: '1',
            prop2: 2,
        };
        const validator = new Validator<SimpleStructure>({
            prop1: (value) => (value === '1' ? 'error' : ''),
            prop2: (value) => (value === 1 ? 'error' : ''),
        });
        expect(validator.validateFields(simpleStructure)).toEqual({ prop1: 'error', prop2: '' });
    });

    it('Validate fields of a simple structure with structure validators', () => {
        const simpleStructure: SimpleStructure = {
            prop1: '1',
            prop2: 2,
        };
        const validator = new Validator<SimpleStructure>({
            prop1: (value) => (value === '1' ? 'error' : ''),
            prop2: (value, structure) => (structure.prop1 === '1' && value === 2 ? 'error' : ''),
        });
        expect(validator.validateFields(simpleStructure)).toEqual({ prop1: 'error', prop2: 'error' });
    });

    it('Validate fields of a simple structure with a partial field', () => {
        const strucutre: SimpleStructureWithPartialField = {
            prop1: '1',
        };
        const validator = new Validator<SimpleStructureWithPartialField>({
            prop1: (value) => (value === '1' ? 'error' : ''),
            prop2: (value) => (!value ? 'error' : ''),
        });
        expect(validator.validateFields(strucutre)).toEqual({ prop1: 'error' });
    });

    it('Validate fields of a simple structure with arrays', () => {
        const strucutre: SimpleStructureWithArrays = {
            prop1: '1',
            prop2: 2,
            prop3: [1, 2, 3],
        };
        const validator = new Validator<SimpleStructureWithArrays>({
            prop1: (value) => (value === '1' ? 'error' : ''),
            prop2: (value, structure) => (structure.prop1 === '1' && value === 2 ? 'error' : ''),
            prop3: (value) => (value % 2 === 0 ? 'error' : ''),
        });
        expect(validator.validateFields(strucutre)).toEqual({
            prop1: 'error',
            prop2: 'error',
            prop3: ['', 'error', ''],
        });
    });

    it('Validate fields of a complex structure', () => {
        const strucutre: ComplexStructure = {
            prop1: '',
            prop2: [1, 2, 3],
            prop3: {
                subProp1: [0, 0],
                subProp2: [
                    {
                        subSubProp1: 'test',
                    },
                    {
                        subSubProp1: 'not-test',
                    },
                ],
            },
        };
        const validator = new Validator<ComplexStructure>({
            prop1: (value) => (value === '' ? 'error' : ''),
            prop3: {
                subProp1: (value) => (value % 2 === 0 ? 'error' : ''),
                subProp2: {
                    subSubProp1: (value) => (value === 'test' ? 'error' : ''),
                },
            },
        });
        expect(validator.validateFields(strucutre)).toEqual({
            prop1: 'error',
            prop2: ['', '', ''],
            prop3: {
                subProp1: ['error', 'error'],
                subProp2: [
                    {
                        subSubProp1: 'error',
                    },
                    {
                        subSubProp1: '',
                    },
                ],
            },
        });
    });

    it('Validate fields of a complex structure with array in array', () => {
        const strucutre: ComplexStructureWithArrayInArray = {
            prop1: '',
            prop2: [1, 2, 3],
            prop3: {
                subProp1: [0, 0],
                subProp2: [
                    {
                        subSubProp1: ['test'],
                    },
                    {
                        subSubProp1: ['not-test'],
                    },
                ],
            },
        };
        const validator = new Validator<ComplexStructureWithArrayInArray>({
            prop1: (value) => (value === '' ? 'error' : ''),
            prop3: {
                subProp1: (value) => (value % 2 === 0 ? 'error' : ''),
                subProp2: {
                    subSubProp1: (value) => (value === 'test' ? 'error' : ''),
                },
            },
        });
        expect(validator.validateFields(strucutre)).toEqual({
            prop1: 'error',
            prop2: ['', '', ''],
            prop3: {
                subProp1: ['error', 'error'],
                subProp2: [
                    {
                        subSubProp1: ['error'],
                    },
                    {
                        subSubProp1: [''],
                    },
                ],
            },
        });
    });

    it('Validate fields of a complex structure with array in array with indexes', () => {
        const strucutre: ComplexStructureWithArrayInArray = {
            prop1: '',
            prop2: [1, 2, 3],
            prop3: {
                subProp1: [0, 0],
                subProp2: [
                    {
                        subSubProp1: ['test'],
                    },
                    {
                        subSubProp1: ['not-test', 'test', 'test'],
                    },
                ],
            },
        };
        const validator = new Validator<ComplexStructureWithArrayInArray>({
            prop1: (value) => (value === '' ? 'error' : ''),
            prop2: (value, structure, indexes) => (indexes[0] >= 2 ? 'error' : ''),
            prop3: {
                subProp1: (value) => (value % 2 === 0 ? 'error' : ''),
                subProp2: {
                    subSubProp1: (value, structure, indexes) => {
                        const id = structure.prop3.subProp2[indexes[0]].subSubProp1.findIndex((elem) => elem === value);
                        if (id !== -1 && id !== indexes[1]) {
                            return 'error';
                        }
                        return '';
                    },
                },
            },
        });
        expect(validator.validateFields(strucutre)).toEqual({
            prop1: 'error',
            prop2: ['', '', 'error'],
            prop3: {
                subProp1: ['error', 'error'],
                subProp2: [
                    {
                        subSubProp1: [''],
                    },
                    {
                        subSubProp1: ['', '', 'error'],
                    },
                ],
            },
        });
    });
});

describe('Validator.validateStructure', () => {
    it('Validate structure of a simple structure', () => {
        const simpleStructure: SimpleStructure = {
            prop1: '1',
            prop2: 2,
        };
        const validator = new Validator<SimpleStructure, 'error1'>(
            {},
            {
                error1: (structure) => (structure.prop1 && structure.prop2 ? 'error' : ''),
            },
        );
        expect(validator.validateStructure(simpleStructure)).toEqual({ error1: 'error' });
    });
});

describe('Validator.validate', () => {
    it('Validate of a complex structure', () => {
        const strucutre: ComplexStructure = {
            prop1: '',
            prop2: [1, 2, 3],
            prop3: {
                subProp1: [0, 0],
                subProp2: [
                    {
                        subSubProp1: 'test',
                    },
                    {
                        subSubProp1: 'not-test',
                    },
                ],
            },
        };
        const validator = new Validator<ComplexStructure, 'error1' | 'error2'>(
            {
                prop1: (value) => (value === '' ? 'error' : ''),
                prop3: {
                    subProp1: (value) => (value % 2 === 0 ? 'error' : ''),
                    subProp2: {
                        subSubProp1: (value) => (value === 'test' ? 'error' : ''),
                    },
                },
            },
            {
                error1: (structure) => (structure.prop2.length < 2 ? 'error' : ''),
                error2: (structure) =>
                    structure.prop3.subProp1.length === structure.prop3.subProp2.length ? 'error' : '',
            },
        );
        expect(validator.validate(strucutre)).toEqual({
            fields: {
                prop1: 'error',
                prop2: ['', '', ''],
                prop3: {
                    subProp1: ['error', 'error'],
                    subProp2: [
                        {
                            subSubProp1: 'error',
                        },
                        {
                            subSubProp1: '',
                        },
                    ],
                },
            },
            structure: {
                error1: '',
                error2: 'error',
            },
        });
    });
});

describe('Validator.hasFieldsErrors', () => {
    it('has errors in fields in a simple structure with an error', () => {
        const simpleStructure: SimpleStructure = {
            prop1: '1',
            prop2: 2,
        };
        const validator = new Validator<SimpleStructure>({
            prop1: (value) => (value === '1' ? 'error' : ''),
        });
        expect(validator.hasFieldsErrors(validator.validateFields(simpleStructure))).toEqual(true);
    });

    it('has errors in fields in a simple structure without errors', () => {
        const simpleStructure: SimpleStructure = {
            prop1: '0',
            prop2: 2,
        };
        const validator = new Validator<SimpleStructure>({
            prop1: (value) => (value === '1' ? 'error' : ''),
        });
        expect(validator.hasFieldsErrors(validator.validateFields(simpleStructure))).toEqual(false);
    });

    it('has errors in fields in a complex structure with deep errors', () => {
        const strucutre: ComplexStructure = {
            prop1: '',
            prop2: [1, 2, 3],
            prop3: {
                subProp1: [0, 0],
                subProp2: [
                    {
                        subSubProp1: 'test',
                    },
                    {
                        subSubProp1: 'not-test',
                    },
                ],
            },
        };
        const validator = new Validator<ComplexStructure>({
            prop3: {
                subProp1: (value) => (value % 2 === 0 ? 'error' : ''),
                subProp2: {
                    subSubProp1: (value) => (value === 'test' ? 'error' : ''),
                },
            },
        });
        expect(validator.hasFieldsErrors(validator.validateFields(strucutre))).toEqual(true);
    });
});

describe('Validator.hasStructureErrors', () => {
    it('has structure errors in the structure', () => {
        const simpleStructure: SimpleStructure = {
            prop1: '1',
            prop2: 2,
        };
        const validator = new Validator<SimpleStructure, 'error1'>(
            {},
            {
                error1: (structure) => (structure.prop1 && structure.prop2 ? 'error' : ''),
            },
        );
        expect(validator.hasStructureErrors(validator.validateStructure(simpleStructure))).toEqual(true);
    });
});

describe('Validator.hasErrors', () => {
    it('has errors in the structure', () => {
        const strucutre: ComplexStructure = {
            prop1: '',
            prop2: [1, 2, 3],
            prop3: {
                subProp1: [0, 0],
                subProp2: [
                    {
                        subSubProp1: 'test',
                    },
                    {
                        subSubProp1: 'not-test',
                    },
                ],
            },
        };
        const validator = new Validator<ComplexStructure, 'error1' | 'error2'>(
            {
                prop3: {
                    subProp1: (value) => (value % 2 === 0 ? 'error' : ''),
                    subProp2: {
                        subSubProp1: (value) => (value === 'test' ? 'error' : ''),
                    },
                },
            },
            {
                error1: (structure) => (structure.prop2.length < 2 ? 'error' : ''),
                error2: (structure) =>
                    structure.prop3.subProp1.length === structure.prop3.subProp2.length ? 'error' : '',
            },
        );
        expect(validator.hasErrors(validator.validate(strucutre))).toEqual(true);
    });
});

describe('combo', () => {
    it('combo one function', () => {
        const simpleStructure: SimpleStructure = {
            prop1: 'test',
            prop2: 2,
        };
        const comboFunction = combo((value: string, structure: SimpleStructure) => value === 'test' ? 'error' : '');
        expect(comboFunction(simpleStructure.prop1, simpleStructure, [])).toEqual('error');
    });

    it('combo three function', () => {
        const simpleStructure: SimpleStructure = {
            prop1: 'test',
            prop2: 2,
        };
        const comboFunction = combo(
            (value: string, structure: SimpleStructure) => value === 't' ? 'error1' : '',
            (value: string, structure: SimpleStructure) => value === 'test' ? 'error2' : '',
            (value: string, structure: SimpleStructure) => value === 'tester' ? 'error3' : '',
        );
        expect(comboFunction(simpleStructure.prop1, simpleStructure, [])).toEqual('error2');
    });
});
