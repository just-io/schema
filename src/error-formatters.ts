export interface ErrorFormatters {
    lang: string;
    string: {
        type: () => string;
        enum: (values: string[]) => string;
        regexp: (regexp: RegExp) => string;
        minLength: (minLength: number) => string;
        maxLength: (maxLength: number) => string;
    };
    number: {
        type: () => string;
        integer: () => string;
        enum: (values: number[]) => string;
        minimum: (minimum: number) => string;
        maximum: (max: number) => string;
    };
    boolean: () => string;
    null: () => string;
    undefined: () => string;
    object: {
        type: () => string;
        existField: () => string;
        notexistField: () => string;
        oneOf: (keys: string[]) => string;
    };
    value: (value: unknown) => string;
    array: {
        type: () => string;
        maxItems: (maxItems: number) => string;
        minItems: (minItems: number) => string;
        unique: () => string;
    };
}

export const defaultErrorFormatters: ErrorFormatters = {
    lang: 'default',
    string: {
        type: () => 'Should be "string" type.',
        enum: (values: string[]) =>
            `Should be included in enum of values: "${values.join('", "')}".`,
        regexp: (regexp: RegExp) => `Should match regexp "${regexp.source}".`,
        minLength: (minLength: number) => `Should contain more than or equal ${minLength} symbols.`,
        maxLength: (maxLength: number) => `Should contain less than or equal ${maxLength} symbols.`,
    },
    number: {
        type: () => 'Should be "number" type.',
        integer: () => 'Should be integer value.',
        enum: (values: number[]) => `Should be included in enum of values: ${values.join(', ')}.`,
        minimum: (minimum: number) => `Should be more than or equal ${minimum}.`,
        maximum: (maximum: number) => `Should be less than or equal ${maximum}.`,
    },
    boolean: () => 'Should be "boolean" type.',
    null: () => 'Should be "null" type.',
    undefined: () => 'Should be "undefined" type.',
    object: {
        type: () => 'Should be "object" type.',
        existField: () => 'Should be existed.',
        notexistField: () => 'Should not be existed.',
        oneOf: (keys: string[]) => `Should be one of "${keys.join('", "')}".`,
    },
    value: (value: unknown) => `Should be equal "${value}".`,
    array: {
        type: () => 'Should be "array" type.',
        maxItems: (maxItems: number) => `Should contain more than or equal ${maxItems} items.`,
        minItems: (minItems: number) => `Should contain less than or equal ${minItems} items.`,
        unique: () => 'All items should be unique.',
    },
};
