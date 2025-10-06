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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    find<T = any>(structure: any): T | undefined {
        let current = structure;
        for (const path of this.#paths) {
            if (!Array.isArray(current) || typeof current !== 'object' || current === null) {
                return undefined;
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            current = current[path as any];
        }

        return current;
    }

    toString(separator = '/', ...roots: (string | number)[]): string {
        return roots.concat(this.#paths).join(separator);
    }

    static fromString(pointer: string, separator = '/', rootsCount = 0): Pointer {
        return new Pointer(...pointer.split(separator).slice(rootsCount));
    }
}
