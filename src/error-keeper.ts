import { defaultErrorFormatters, ErrorFormatters } from './error-formatters';
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

export class ErrorSet extends Error {
    #errors: ValidationError[];

    constructor(errors: ValidationError[]) {
        super();
        this.#errors = errors;
    }

    toJSON() {
        return {
            errors: this.#errors,
        };
    }
}

export class ErrorKeeper {
    #errors: RawValidationError[] = [];

    #formatters: ErrorFormatters;

    #pointer: Pointer;

    #group: number | undefined;

    constructor();
    constructor(formatters: ErrorFormatters);
    constructor(pointer: Pointer, formatters: ErrorFormatters);
    constructor(arg1?: Pointer | ErrorFormatters, arg2?: ErrorFormatters) {
        this.#pointer = arg1 instanceof Pointer ? arg1 : new Pointer();
        this.#formatters = arg2
            ? arg2
            : !(arg1 instanceof Pointer) && arg1 !== undefined
              ? arg1
              : defaultErrorFormatters;
    }

    forEach(callbackfn: (error: RawValidationError) => void): void {
        this.#errors.forEach(callbackfn);
    }

    hasErrors(): boolean {
        return this.#errors.length > 0;
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

    get formatters(): ErrorFormatters {
        return this.#formatters;
    }

    set group(group: number) {
        this.#group = group;
    }

    get group(): number | undefined {
        return this.#group;
    }

    child(...paths: (string | number)[]): ErrorKeeperWithParent {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return new ErrorKeeperWithParent(this, this.#pointer.concat(...paths), this.#formatters);
    }

    fork(...paths: (string | number)[]): ErrorKeeperWithParent {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        const errorKeeperWithParent = new ErrorKeeperWithParent(this, this.#pointer.concat(...paths), this.#formatters);
        errorKeeperWithParent.mode = 'on-demand';
        return errorKeeperWithParent;
    }

    getStringErrorsByPointer(pointer: Pointer): string[] {
        return this.#errors.filter((error) => error.pointer.equal(pointer)).map((error) => error.details);
    }

    getStringErrorsByPointerPrefix(pointerPrefix: Pointer): string[] {
        return this.#errors.filter((error) => error.pointer.startWith(pointerPrefix)).map((error) => error.details);
    }

    makeStringErrors(): ValidationError[] {
        return this.#errors.map((error) => {
            const validationError: ValidationError = { pointer: error.pointer.raw(), details: error.details };
            if (error.group !== undefined) {
                validationError.group = error.group;
            }
            return validationError;
        });
    }

    makeErrorSet(): ErrorSet {
        return new ErrorSet(this.makeStringErrors());
    }

    clear(): this {
        this.#errors = [];
        return this;
    }
}

export type ErrorKeeperWithParentPushMode = 'instant' | 'on-demand';

export class ErrorKeeperWithParent extends ErrorKeeper {
    #mode: ErrorKeeperWithParentPushMode = 'instant';

    #parent: ErrorKeeper;

    constructor(parent: ErrorKeeper);
    constructor(parent: ErrorKeeper, formatters: ErrorFormatters);
    constructor(parent: ErrorKeeper, pointer: Pointer, formatters: ErrorFormatters);
    constructor(parent: ErrorKeeper, arg1?: Pointer | ErrorFormatters, arg2?: ErrorFormatters) {
        super(arg1 as Pointer, arg2 as ErrorFormatters);
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

export class DummyErrorKeeper extends ErrorKeeper {
    push(pointer: Pointer, details: string, group?: number): void;
    push(details: string, group?: number): void;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    push(arg1: Pointer | string, arg2?: string | number, arg3?: number): void {}
}

export const dummyErrorKeeper = new DummyErrorKeeper();
