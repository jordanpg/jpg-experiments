import { describe, expect, it } from "vitest";
import { parseVec } from "../../src/common/utils";

describe("#parseVec", () => {
    it("returns expected output for undefined length", () => {
        expect(parseVec("0 1 2 3 4 5 6 7")).toStrictEqual([
            0, 1, 2, 3, 4, 5, 6, 7,
        ]);
    });

    it("returns expected output for given length", () => {
        expect(parseVec("0 1 2 3 4 5 6 7", 4)).toStrictEqual([0, 1, 2, 3]);
    });

    it("returns empty array with empty input", () => {
        expect(parseVec("")).toHaveLength(0);
    });

    it("returns NaN for non-numeric elements", () => {
        expect(parseVec("0 1 p")).toStrictEqual([0, 1, NaN]);
    });
});
