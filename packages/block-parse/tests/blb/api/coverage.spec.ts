import path from "path";
import { describe, expect, it } from "vitest";
import tryParseCoverage, {
    parseSideCoverage,
} from "../../../src/blb/api/coverage";
import type { Coverage } from "../../../src/blb/types";
import { testData } from "../../testUtils";

describe("#parseSideCoverage", () => {
    it.each<{ line: string; expected: Coverage | null }>([
        { line: "0 : 0", expected: { cullAdjacent: false, area: 0 } },
        { line: "", expected: null },
        { line: "1 : 6", expected: { cullAdjacent: true, area: 6 } },
    ])(
        `$line parses as expected ($expected.cullAdjacent, $expected.area)`,
        ({ line, expected }) => {
            expect(parseSideCoverage(line)).toStrictEqual(expected);
        },
    );
});

describe("#tryParseCoverage", async () => {
    const tests = await testData([
        path.resolve(__dirname, "./coverage.data/4x4x2roundCornerBars"),
    ]);

    it.each(tests)("expected output ($name)", ({ content, expected }) => {
        expect(tryParseCoverage(content.split("\n"))[0].coverage).toStrictEqual(
            expected,
        );
    });

    it.each([
        {
            name: "invalid line",
            input: ["COVERAGE:", "--x-", "uubb", "invalid here loel", "----"],
        },
        {
            name: "missing header",
            input: ["uuuu", "----", "bbbb"],
        },
    ])("fails as expected (%#, $name)", ({ input }) => {
        expect(() => tryParseCoverage(input)).toThrowError();
    });
});
