import { ErrorFormatter } from './error-formatter';
import { Pointer } from './pointer';

export type ValidationError = {
    pointer: string[];
    details: string;
    group?: number;
};

type RawValidationError = {
    pointer: Pointer;
    details: string;
    group?: number;
};

export class ErrorSet<E> extends Error {
    #errors: E[];

    constructor(errors: E[]) {
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

    toJSON() {
        return {
            errors: this.#errors,
        };
    }
}

export class ErrorKeeper<L extends string> {
    #errors: RawValidationError[] = [];

    #formatter: ErrorFormatter;

    #lang: L;

    #pointer: Pointer;

    #group: number | undefined;

    constructor(lang: L, formatter: ErrorFormatter);
    constructor(pointer: Pointer, lang: L, formatter: ErrorFormatter);
    constructor(arg1: Pointer | L, arg2: L | ErrorFormatter, formatter?: ErrorFormatter) {
        if (arg1 instanceof Pointer) {
            this.#pointer = arg1;
            this.#lang = arg2 as L;
            this.#formatter = formatter as ErrorFormatter;
        } else {
            this.#pointer = new Pointer();
            this.#lang = arg1 as L;
            this.#formatter = arg2 as ErrorFormatter;
        }
    }

    forEach(callbackfn: (error: RawValidationError) => void): void {
        this.#errors.forEach(callbackfn);
    }

    hasErrors(): boolean {
        return this.#errors.length > 0;
    }

    get lang(): L {
        return this.#lang;
    }

    push(pointer: Pointer, details: string, group?: number): void;
    push(details: string, group?: number): void;
    push(arg1: Pointer | string, arg2?: string | number, arg3?: number): void {
        const pointer = arg1 instanceof Pointer ? arg1 : this.pointer;
        const details = !(arg1 instanceof Pointer) ? arg1 : (arg2 as string);
        const group = (!(arg1 instanceof Pointer) ? (arg2 as number) : arg3) ?? this.#group;
        if (group !== undefined) {
            this.#errors.push({ pointer, details, group });
        } else {
            this.#errors.push({ pointer, details });
        }
    }

    get pointer(): Pointer {
        return this.#pointer;
    }

    get formatter(): ErrorFormatter {
        return this.#formatter;
    }

    set group(group: number) {
        this.#group = group;
    }

    get group(): number | undefined {
        return this.#group;
    }

    child(...paths: (string | number)[]): ErrorKeeperWithParent<L> {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return new ErrorKeeperWithParent(
            this,
            this.#pointer.concat(...paths),
            this.#lang,
            this.#formatter,
        );
    }

    fork(...paths: (string | number)[]): ErrorKeeperWithParent<L> {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        const errorKeeperWithParent = new ErrorKeeperWithParent(
            this,
            this.#pointer.concat(...paths),
            this.#lang,
            this.#formatter,
        );
        errorKeeperWithParent.mode = 'on-demand';
        return errorKeeperWithParent;
    }

    getStringErrorsByPointer(pointer: Pointer): string[] {
        return this.#errors
            .filter((error) => error.pointer.equal(pointer))
            .map((error) => error.details);
    }

    getStringErrorsByPointerPrefix(pointerPrefix: Pointer): string[] {
        return this.#errors
            .filter((error) => error.pointer.startWith(pointerPrefix))
            .map((error) => error.details);
    }

    makeStringErrors(): ValidationError[] {
        return this.#errors.map((error) => {
            const validationError: ValidationError = {
                pointer: error.pointer.raw(),
                details: error.details,
            };
            if (error.group !== undefined) {
                validationError.group = error.group;
            }
            return validationError;
        });
    }

    makeErrorSet(): ErrorSet<ValidationError> {
        return new ErrorSet(this.makeStringErrors());
    }

    clear(): this {
        this.#errors = [];
        return this;
    }
}

export type ErrorKeeperWithParentPushMode = 'instant' | 'on-demand';

export class ErrorKeeperWithParent<L extends string> extends ErrorKeeper<L> {
    #mode: ErrorKeeperWithParentPushMode = 'instant';

    #parent: ErrorKeeper<L>;

    constructor(parent: ErrorKeeper<L>, pointer: Pointer, lang: L, formatter: ErrorFormatter) {
        super(pointer, lang, formatter);
        this.#parent = parent;
    }

    set mode(mode: ErrorKeeperWithParentPushMode) {
        this.#mode = mode;
    }

    get mode(): ErrorKeeperWithParentPushMode {
        return this.#mode;
    }

    push(pointer: Pointer, details: string, group?: number): void;
    push(details: string, group?: number): void;
    push(arg1: Pointer | string, arg2?: string | number, arg3?: number): void {
        const pointer = arg1 instanceof Pointer ? arg1 : this.pointer;
        const details = !(arg1 instanceof Pointer) ? arg1 : (arg2 as string);
        const group = (!(arg1 instanceof Pointer) ? (arg2 as number) : arg3) ?? this.group;
        if (this.#mode === 'instant') {
            this.#parent.push(pointer, details, group);
        } else {
            super.push(pointer, details, group);
        }
    }

    flush(): this {
        this.forEach((error) => {
            this.#parent.push(error.pointer, error.details, error.group);
        });
        this.clear();
        return this;
    }
}

export class DummyErrorKeeper<L extends string> extends ErrorKeeper<L> {
    push(pointer: Pointer, details: string, group?: number): void;
    push(details: string, group?: number): void;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    push(arg1: Pointer | string, arg2?: string | number, arg3?: number): void {}
}
