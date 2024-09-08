import { describe, expect, it } from "vitest";
import { tryParseHeader } from "../../../src/blb/api/header";
import type { BLBType } from "../../../src/blb/types";

describe("#blbParseHeader", () => {
    it("throws on invalid input", () => {
        expect(() => tryParseHeader([])).toThrowError(SyntaxError);
        expect(() => tryParseHeader(["10 10 10", ""])).toThrowError(
            SyntaxError,
        );
        expect(() => tryParseHeader(["", "BRICK"])).toThrowError(SyntaxError);
    });
    it("produces proper size", () => {
        const tests: [string[], number[]][] = [
            [
                ["1 2 3", "BRICK"],
                [1, 2, 3],
            ],
            [
                ["4 5 6", "BRICK"],
                [4, 5, 6],
            ],
            [
                ["1 2 3", "SPECIAL", ""],
                [1, 2, 3],
            ],
            [
                ["4 5 6", "", "SPECIAL"],
                [4, 5, 6],
            ],
        ];

        tests.forEach((v) =>
            expect(tryParseHeader(v[0])[0].size).toStrictEqual(v[1]),
        );
    });
    it("produces proper type", () => {
        const tests: [string[], BLBType][] = [
            [["1 2 3", "BRICK"], "BRICK"],
            [["4 5 6", "BRICK"], "BRICK"],
            [["1 2 3", "SPECIAL", ""], "SPECIAL"],
            [["4 5 6", "", "SPECIAL"], "SPECIAL"],
        ];

        tests.forEach((v) =>
            expect(tryParseHeader(v[0])[0].type).toStrictEqual(v[1]),
        );
    });
});
