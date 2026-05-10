import { ErrorSet } from './error-set';
import { Pointer } from './pointer';

export type ValidationError = {
    pointer: Pointer;
    detail: string;
    group?: number;
};

export class ErrorKeeper<E extends ValidationError = ValidationError> {
    #errors: E[] = [];

    #lang: string;

    #pointer: Pointer;

    #group: number | undefined;

    constructor(pointer: Pointer = new Pointer(), lang: string = 'default') {
        this.#pointer = pointer;
        this.#lang = lang;
    }

    forEach(callbackfn: (error: E) => void): void {
        this.#errors.forEach(callbackfn);
    }

    hasErrors(): boolean {
        return this.#errors.length > 0;
    }

    get lang(): string {
        return this.#lang;
    }

    push(
        ...errors: (Partial<Pick<E, 'pointer' | 'group'>> & Omit<E, 'pointer' | 'group'>)[]
    ): this {
        for (const error of errors) {
            error.pointer ??= this.#pointer;
            error.group ??= this.#group;
            this.#errors.push(error as E);
        }

        return this;
    }

    add(...errors: E[]): this {
        this.#errors.push(...errors);

        return this;
    }

    get pointer(): Pointer {
        return this.#pointer;
    }

    set group(group: number) {
        this.#group = group;
    }

    get group(): number | undefined {
        return this.#group;
    }

    child(...paths: (string | number)[]): ErrorKeeper<E> {
        return new ErrorKeeper(this.#pointer.concat(...paths), this.#lang);
    }

    getErrorDetailsByPointer(pointer: Pointer): string[] {
        return this.#errors
            .filter((error) => error.pointer.equal(pointer))
            .map((error) => error.detail);
    }

    getErrorDetailsByPointerPrefix(pointerPrefix: Pointer): string[] {
        return this.#errors
            .filter((error) => error.pointer.startWith(pointerPrefix))
            .map((error) => error.detail);
    }

    makeErrorSet(): ErrorSet<E>;
    makeErrorSet<T>(transform: (error: E) => T): ErrorSet<T>;
    makeErrorSet<T = E>(transform?: (error: E, i: number, errors: E[]) => T): ErrorSet<E | T> {
        if (transform) {
            return new ErrorSet(this.#errors.map(transform));
        }
        return new ErrorSet(this.#errors);
    }

    append(errorSet: ErrorSet<E>): this {
        this.#errors.push(...errorSet.errors);

        return this;
    }

    clear(): this {
        this.#errors = [];

        return this;
    }
}
