export type JSONSchemaBoolean = {
    type: 'boolean';
    title?: string;
    description?: string;
    const?: boolean;
    defaut?: boolean;
};

export type JSONSchemaNumber = {
    type: 'number';
    title?: string;
    description?: string;
    minimum?: number;
    maximum?: number;
    const?: number;
    enum?: number[];
    defaut?: number;
};

export type JSONSchemaInteger = {
    type: 'integer';
    title?: string;
    description?: string;
    minimum?: number;
    maximum?: number;
    const?: number;
    enum?: number[];
    defaut?: number;
};

export type JSONSchemaNull = {
    type: 'null';
    title?: string;
    description?: string;
    const?: null;
    defaut?: null;
};

export type JSONSchemaString = {
    type: 'string';
    title?: string;
    description?: string;
    const?: string;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    enum?: string[];
    defaut?: string;
};

export type JSONSchemaAny = {
    type?: never;
    title?: string;
    description?: string;
    defaut?: unknown;
};

export type JSONSchemaRef = {
    $ref: string;
    title?: string;
    description?: string;
    defaut?: unknown;
};

export type JSONSchemaValue =
    | JSONSchemaBoolean
    | JSONSchemaNumber
    | JSONSchemaInteger
    | JSONSchemaNull
    | JSONSchemaString
    | JSONSchemaArray
    | JSONSchemaTuple
    | JSONSchemaObject
    | JSONSchemaRecord
    | JSONSchemaAny
    | JSONSchemaOneOf
    | JSONSchemaRef;

export type JSONSchemaRoot = JSONSchemaValue & {
    $id?: string;
    $schema?: string;
    $defs?: Record<string, JSONSchemaValue>;
};

export type JSONSchemaOneOf = {
    oneOf: JSONSchemaValue[];
    title?: string;
    description?: string;
    defaut?: unknown;
};

export type JSONSchemaArray = {
    type: 'array';
    title?: string;
    description?: string;
    enum?: JSONSchemaValue[];
    maxItems?: number;
    minItems?: number;
    items: JSONSchemaValue;
    uniqueItems?: boolean;
    defaut?: unknown;
};

export type JSONSchemaTuple = {
    type: 'array';
    title?: string;
    description?: string;
    prefixItems: JSONSchemaValue[];
    defaut?: unknown;
};

export type JSONSchemaObject = {
    type: 'object';
    title?: string;
    description?: string;
    properties: Record<string, JSONSchemaValue>;
    additionalProperties: false;
    required?: string[];
    defaut?: unknown;
};

export type JSONSchemaRecord = {
    type: 'object';
    title?: string;
    description?: string;
    additionalProperties: JSONSchemaValue;
    defaut?: unknown;
};
