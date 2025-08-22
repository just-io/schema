export class Pointer {
    #paths: (string | number)[];

    constructor(...paths: (string | number)[]) {
        this.#paths = paths;
    }

    concat(...paths: (string | number)[]): Pointer {
        return new Pointer(...this.#paths.concat(paths));
    }

    equal(pointer: Pointer): boolean {
        return (
            this.#paths.length === pointer.#paths.length && this.#paths.every((path, i) => path === pointer.#paths[i])
        );
    }

    startWith(pointer: Pointer): boolean {
        return pointer.#paths.every((path, i) => path === this.#paths[i]);
    }

    toString(separator = '/', start = '/'): string {
        return start + this.#paths.join(separator);
    }

    raw(): string[] {
        return this.#paths.map(String);
    }
}
