import { describe, expect, it } from "vitest";
import { parseVec, stripComments } from "../../src/common/utils";

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

describe("#stripComments", () => {
    it.each([
        [
            "no change",
            `
the quick brown fox
jumped over the lazy dog   
`,
            undefined,
        ],
        [
            "removes comments",
            `
the quick brown fox
// line removed
jumped over the lazy dog // inline with leading whitespace removed
               // with whitespace; whole line still removed
                
`,
            `
the quick brown fox
jumped over the lazy dog
                
`,
        ],
    ])(
        "creates expected output (%#: %s)",
        (_: string, input: string, expected?: string) => {
            expect(stripComments(input.split("\n"))).toStrictEqual(
                (expected ?? input).split("\n"),
            );
        },
    );
});
