import { ValidationError } from './schema';

type JSONValidationError = {
    pointer: string[];
    detail: string;
    group?: number;
};

export function transformToJSON(error: ValidationError): JSONValidationError {
    const validationError: JSONValidationError = {
        pointer: error.pointer.raw(),
        detail: error.detail,
    };
    if (error.group !== undefined) {
        validationError.group = error.group;
    }
    return validationError;
}
