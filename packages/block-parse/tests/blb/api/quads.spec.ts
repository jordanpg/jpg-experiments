import path from "path";
import { describe, expect, it } from "vitest";
import {
    QuadPartParse,
    tryParseFace,
    tryParseQuad,
    tryParseQuads,
} from "../../../src/blb/api/quad";
import { FixedLengthArray, Quad, QuadTexType } from "../../../src/blb/types";
import { testData } from "../../testUtils";

describe("#tryParseFace", () => {
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
        expect(tryParseFace(input, len)).toStrictEqual(expected);
    });

    it("fails when too few vectors", () => {
        expect(() => tryParseFace(["1 0 0 1", "1 2 3 4"], 4)).toThrowError(
            /expected 4/,
        );
    });

    it.each<[number, string[]]>([
        [3, ["1 0 0", "1", "1 2 3", "5 4 2"]],
        [4, ["1 0 0 0", "1 2", "1 2 3 4", "1 2 3 4"]],
    ])("fails with smaller vector length (len %i)", (length, lines) => {
        expect(() => tryParseFace(lines, length)).toThrowError(
            /vector of length/,
        );
    });
});

describe("#QuadPartParse", () => {
    const blankQuad = () => ({}) as Quad;
    describe("#TEX", () => {
        it.each<[string[], QuadTexType]>([
            [["TEX:TOP"], "TOP"],
            [["TEX:BOTTOMLOOP"], "BOTTOMLOOP"],
            [["TEX:BOTTOMEDGE", ""], "BOTTOMEDGE"],
            [["TEX:SIDE"], "SIDE"],
            [["TEX:RAMP"], "RAMP"],
            [["TEX:PRINT"], "PRINT"],
        ])("%s resolves to %s", (lines, expected) => {
            expect(QuadPartParse.TEX(lines, blankQuad())[1].texture).toEqual(
                expected,
            );
        });

        it.each<[string[], string | RegExp]>([
            [["", "TEX:TOP"], /malformed/],
            [[], /no lines/],
            [["TEX:fanjsdlfkjna"], /texture type/],
        ])("%s throws error (%s)", (lines, err) => {
            expect(() => QuadPartParse.TEX(lines, blankQuad())).toThrowError(
                err,
            );
        });

        it("returns remaining elements", () => {
            expect(
                QuadPartParse.TEX(
                    ["TEX:TOP", "POSITION:", "1 2 3 4"],
                    blankQuad(),
                )[0],
            ).toStrictEqual(["POSITION:", "1 2 3 4"]);
        });
    });

    const genericVectorListTests: {
        name: keyof typeof QuadPartParse;
        getter: (quad: Quad) => number[][];
        validCases: [string[], number[][]][];
        remainingCase: [string[], string[]];
    }[] = [
        {
            name: "POSITION",
            getter: (q) => q.positions,
            validCases: [
                [
                    ["POSITION:", "1.23 4.56 7.89", "0 0 0", "1 2 3", "4 5 6"],
                    [
                        [1.23, 4.56, 7.89],
                        [0, 0, 0],
                        [1, 2, 3],
                        [4, 5, 6],
                    ],
                ],
            ],
            remainingCase: [
                [
                    "POSITION:",
                    "1.23 4.56 7.89",
                    "0 0 0",
                    "1 2 3",
                    "4 5 6",
                    "asdf",
                    "fdsa",
                    "asdf",
                ],
                ["asdf", "fdsa", "asdf"],
            ],
        },
        {
            name: "COLORS",
            getter: (q) => q.colors!,
            validCases: [
                [
                    [
                        "COLORS:",
                        "1 0.5 0 1",
                        "0 0 0 1",
                        "0.2 0.2 0.2 1",
                        "0.4 0.3 0.2 0.1",
                    ],
                    [
                        [1, 0.5, 0, 1],
                        [0, 0, 0, 1],
                        [0.2, 0.2, 0.2, 1],
                        [0.4, 0.3, 0.2, 0.1],
                    ],
                ],
            ],
            remainingCase: [
                [
                    "COLORS:",
                    "1 0.5 0 1",
                    "0 0 0 1",
                    "0.2 0.2 0.2 1",
                    "0.4 0.3 0.2 0.1",
                    "asdf",
                    "fdsa",
                    "asdf",
                ],
                ["asdf", "fdsa", "asdf"],
            ],
        },
        {
            name: "UV COORDS",
            getter: (q) => q.uvs,
            validCases: [
                [
                    ["UV COORDS:", "-1 0.5", "0 0", "0.2 -0.2", "-0.4 0.3"],
                    [
                        [-1, 0.5],
                        [0, 0],
                        [0.2, -0.2],
                        [-0.4, 0.3],
                    ],
                ],
            ],
            remainingCase: [
                [
                    "UV COORDS:",
                    "-1 0.5",
                    "0 0",
                    "0.2 -0.2",
                    "-0.4 0.3",
                    "asdf",
                    "fdsa",
                    "asdf",
                ],
                ["asdf", "fdsa", "asdf"],
            ],
        },
        {
            name: "NORMALS",
            getter: (q) => q.normals,
            validCases: [
                [
                    [
                        "NORMALS:",
                        "1 0.5 0",
                        "0 0 0",
                        "0.2 0.2 0.2",
                        "0.4 0.3 0.2",
                    ],
                    [
                        [1, 0.5, 0],
                        [0, 0, 0],
                        [0.2, 0.2, 0.2],
                        [0.4, 0.3, 0.2],
                    ],
                ],
            ],
            remainingCase: [
                [
                    "NORMALS:",
                    "1 0.5 0",
                    "0 0 0",
                    "0.2 0.2 0.2",
                    "0.4 0.3 0.2",
                    "asdf",
                    "fdsa",
                    "asdf",
                ],
                ["asdf", "fdsa", "asdf"],
            ],
        },
    ];

    describe.each(genericVectorListTests)(
        "#$name",
        ({ name, validCases, remainingCase, getter }) => {
            it.each(validCases)(
                "expected result produced (case %#)",
                (lines, expected) => {
                    expect(
                        getter(QuadPartParse[name](lines, blankQuad())[1]),
                    ).toStrictEqual(expected);
                },
            );

            it("throws error with too few lines", () => {
                expect(() =>
                    QuadPartParse[name](["", "", "", ""], blankQuad()),
                ).toThrowError(/5 lines/);
            });

            it("throws error with incorrect header", () => {
                expect(() =>
                    QuadPartParse[name](
                        ["INVALID:", "", "", "", ""],
                        blankQuad(),
                    ),
                ).toThrowError(/header line is "INVALID:"/);
            });

            it("returns remaining elements", () => {
                expect(
                    QuadPartParse[name](remainingCase[0], blankQuad())[0],
                ).toStrictEqual(remainingCase[1]);
            });
        },
    );
});

describe("#tryParseQuad", async () => {
    const data = await testData(
        [
            path.resolve(__dirname, "./quads.data/4x4x2roundCornerBars"),
            path.resolve(__dirname, "./quads.data/5x1x20fstripedwindow"),
        ],
        {
            targets: {
                expected: "ts",
            },
        },
    );

    it.each(data)(`quad parses as expected: $name`, ({ content, expected }) => {
        expect(tryParseQuad(content.split("\n"))).toStrictEqual(expected);
    });
});

describe("#tryParseQuads", async () => {
    const data = await testData(
        [path.resolve(__dirname, "./quads.data/4x4x2roundCornerBars.quads")],
        {
            targets: {
                expected: "ts",
            },
        },
    );

    it.each(data)(`quads parse as expected: $name`, ({ content, expected }) => {
        expect(tryParseQuads(content.split("\n"))).toStrictEqual(expected);
    });
});
