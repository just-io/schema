export type Errors<T> = {
    [K in keyof T]: T[K] extends object
        ? T[K] extends (infer A)[]
            ? A extends object
                ? Errors<A>[]
                : string[]
            : Errors<T[K]>
        : string;
};

export type ValidatorHandler<T, S> = (value: T, structure: S, indexes: number[]) => string;

export type StructureValidatorHandler<S> = (structure: S) => string;

export type Validators<T, S> = {
    [K in keyof T]?: T[K] extends object
        ? T[K] extends (infer A)[]
            ? A extends object
                ? Validators<A, S>
                : ValidatorHandler<A, S>
            : Validators<T[K], S>
        : ValidatorHandler<T[K], S>;
};

export type StructureErrors<V extends string> = Record<V, string>;

export interface ComplexErrors<S, V extends string> {
    fields: Errors<S>;
    structure: StructureErrors<V>;
}

export function combo<T, S>(...funcs: ValidatorHandler<T, S>[]): ValidatorHandler<T, S> {
    return (value, structure, index) => {
        return funcs.reduce((error, func) => {
            if (error) {
                return error;
            }
            return func(value, structure, index);
        }, '');
    };
}

class Validator<T, V extends string = ''> {
    protected validators: Validators<T, T>;

    protected structureValidators: Record<V, StructureValidatorHandler<T>>;

    constructor(
        validators: Validators<T, T> = {},
        structureValidators: Record<V, StructureValidatorHandler<T>> = {} as Record<V, StructureValidatorHandler<T>>,
    ) {
        this.validators = validators;
        this.structureValidators = structureValidators;
    }

    protected keys<S, P extends keyof S = keyof S>(structure: Partial<S>): P[] {
        return (Object.keys(structure) as unknown) as P[];
    }

    protected subValidate<S>(current: S, structure: T, indexes: number[], validators?: Validators<S, T>): Errors<S> {
        return this.keys<S>(current).reduce((errors, key) => {
            const value = current[key];
            if (Array.isArray(value)) {
                if (value[0] !== undefined && value[0] !== null && typeof value[0] === 'object') {
                    errors[key] = value.map((elem, i) => {
                        return this.subValidate(elem, structure, indexes.concat(i), validators?.[key] as any);
                    });
                } else {
                    const validator = validators?.[key] as ValidatorHandler<S, T> | undefined;
                    errors[key] = value.map((elem, i) => validator?.(elem, structure, indexes.concat(i)) ?? '');
                }
            } else if (value && typeof value === 'object') {
                const objectValue = value;
                errors[key] = this.subValidate(objectValue, structure, indexes, validators?.[key] as any);
            } else {
                const validator = validators?.[key] as ValidatorHandler<S, T> | undefined;
                if (validator) {
                    errors[key] = validator(value as any, structure, indexes);
                } else {
                    errors[key] = '';
                }
            }
            return errors;
        }, {} as any) as Errors<S>;
    }

    validateFields(structure: T): Errors<T> {
        return this.subValidate<T>(structure, structure, [], this.validators);
    }

    validateStructure(structure: T): StructureErrors<V> {
        return Object.keys(this.structureValidators).reduce((errors, key) => {
            errors[key as V] = this.structureValidators[key as V](structure);
            return errors;
        }, {} as StructureErrors<V>);
    }

    validate(structure: T): ComplexErrors<T, V> {
        return {
            fields: this.validateFields(structure),
            structure: this.validateStructure(structure),
        };
    }

    hasFieldsErrors(errors: Errors<T>): boolean {
        return Object.keys(errors).some((key) => {
            const value = errors[key as keyof T];
            if (Array.isArray(value)) {
                if (value[0] !== undefined && value[0] !== null && typeof value[0] === 'object') {
                    return value.some((elem) => this.hasFieldsErrors(elem));
                }
                return value.some((elem) => elem);
            }
            if (value && typeof value === 'object') {
                return this.hasFieldsErrors(value as any);
            }
            return value;
        });
    }

    hasStructureErrors(errors: StructureErrors<V>): boolean {
        return Object.keys(errors).some((key) => errors[key as V]);
    }

    hasErrors(errors: ComplexErrors<T, V>): boolean {
        return this.hasFieldsErrors(errors.fields) || this.hasStructureErrors(errors.structure);
    }
}

export default Validator;
