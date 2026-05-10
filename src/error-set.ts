export class ErrorSet<E> extends Error {
    #errors: E[];

    constructor(errors: E[] = []) {
        super();
        this.#errors = errors;
    }

    add(...errors: E[]): this {
        this.#errors.push(...errors);

        return this;
    }

    append(handlingErrorSet: ErrorSet<E>): this {
        this.#errors.push(...handlingErrorSet.errors);

        return this;
    }

    get errors(): E[] {
        return this.#errors;
    }

    toJSON(): E[];
    toJSON<T>(transform: (error: E, i: number, errors: E[]) => T): T[];
    toJSON<T = E>(transform?: (error: E, i: number, errors: E[]) => T): (T | E)[] {
        if (transform) {
            return this.#errors.map(transform);
        }
        return this.#errors;
    }
}
