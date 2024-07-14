import { describe, expect, it } from "vitest";
import { parseFace } from "../../../src/blb/api/quad";
import { FixedLengthArray } from "../../../src/blb/types";

describe("#parseFace", () => {
    it.each<[string[], number, FixedLengthArray<number[], 4>]>([
        [
            ["1 0 0", "1 2 3", "4 5 6", "7 8 9"],
            3,
            [
                [1, 0, 0],
                [1, 2, 3],
                [4, 5, 6],
                [7, 8, 9],
            ],
        ],
        [
            ["1 0 0", "1 shouldbenan 3", "4 5 6", "7 8 9"],
            3,
            [
                [1, 0, 0],
                [1, NaN, 3],
                [4, 5, 6],
                [7, 8, 9],
            ],
        ],
        [
            ["1 0 0 1", "1 2 3 4", "4 5 6 7", "7 8 9 8"],
            4,
            [
                [1, 0, 0, 1],
                [1, 2, 3, 4],
                [4, 5, 6, 7],
                [7, 8, 9, 8],
            ],
        ],
        [
            ["1 0", "1 2", "3 4", "5 6"],
            2,
            [
                [1, 0],
                [1, 2],
                [3, 4],
                [5, 6],
            ],
        ],
    ])("produces expected output (case %#)", (input, len, expected) => {
        expect(parseFace(input, len)).toStrictEqual(expected);
    });

    it("fails when too few vectors", () => {
        expect(() => parseFace(["1 0 0 1", "1 2 3 4"], 4)).toThrowError(
            /expected 4/,
        );
    });

    it.each<[number, string[]]>([
        [3, ["1 0 0", "1", "1 2 3", "5 4 2"]],
        [4, ["1 0 0 0", "1 2", "1 2 3 4", "1 2 3 4"]],
    ])("fails with smaller vector length (len %i)", (length, lines) => {
        expect(() => parseFace(lines, length)).toThrowError(/vector of length/);
    });
});
