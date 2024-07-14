import { Tuple } from "../../common/types.js";
import { parseVec } from "../../common/utils.js";
import { FixedLengthArray } from "../types.js";

export function parseFace<N extends number>(
    lines: string[],
    vectorLength: N,
): FixedLengthArray<Tuple<number, N>, 4>;
export function parseFace(lines: string[], vectorLength: number): number[][];
export function parseFace(lines: string[], vectorLength: number) {
    if (!lines || lines.length < 4) {
        throw new Error(
            `Cannot extract Vector${vectorLength}f for quad, only ${lines.length} values given, expected 4.`,
        );
    }

    const vals = lines.map((l) => parseVec(l, vectorLength)).slice(0, 4);
    vals.forEach((v) => {
        if (v.length === vectorLength) return;
        throw new Error(
            `Expected Vector${vectorLength}f, got vector of length ${v.length} instead.`,
        );
    });
    return vals;
}
