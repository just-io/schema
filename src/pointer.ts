export class Pointer {
    #paths: string[];

    constructor(...paths: (string | number)[]) {
        this.#paths = paths.map(String);
    }

    concat(...paths: (string | number)[]): Pointer {
        return new Pointer(...this.#paths.concat(paths.map(String)));
    }

    slice(start: number = 0, end = this.#paths.length): Pointer {
        return new Pointer(...this.#paths.slice(start, end));
    }

    equal(pointer: Pointer): boolean {
        return (
            this.#paths.length === pointer.#paths.length &&
            this.#paths.every((path, i) => path === pointer.#paths[i])
        );
    }

    startWith(pointer: Pointer): boolean {
        return pointer.#paths.every((path, i) => path === this.#paths[i]);
    }

    raw(): string[] {
        return this.#paths;
    }

    toString(separator = '/', ...roots: (string | number)[]): string {
        return roots.concat(this.#paths).join(separator);
    }

    static fromString(pointer: string, separator = '/', rootSlicedCount = 0): Pointer {
        return new Pointer(...pointer.split(separator).slice(rootSlicedCount));
    }
}
