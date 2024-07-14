import { Tuple } from "./types.js";

export function parseVec<N extends number>(
    str: string,
    length: N,
): Tuple<number, N>;
export function parseVec(str: string): number[];
export function parseVec(str: string, length?: number) {
    const vec = str
        .split(/\s+/g)
        .filter((v) => v || v === "0")
        .map((v) => Number(v));
    if (length == undefined) return vec;
    return vec.slice(0, length);
}

export function stripComments(lines: string[]) {
    return (
        lines
            // Remove any comment-only lines
            .filter((l) => !/^(?!\n)\s*\/\/.*$/gm.test(l))
            // Remove any inline comments
            .map((l) => l.replace(/\s*\/\/.+/, ""))
    );
}
