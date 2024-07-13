import { readFile } from "fs/promises";
import path from "path";
import { describe, expect, it } from "vitest";
import {
    extractGridDescription,
    tryParseBrickGrid,
} from "../../../src/blb/api/brickGrid";

const validTests = ["./brickGrid.data/4x4x2roundCornerBars"].map((f) => [
    path.basename(f),
    path.resolve(__dirname, f),
]);

describe("#extractGridDescription", () => {
    it.each(validTests)(
        "generates expected output groups (%s)",
        async (f, file) => {
            const content = await readFile(file + ".txt", {
                encoding: "utf-8",
            });
            const expected = (await import(file + ".json").then(
                (module) => module.default,
            )) as string[][];
            expect(
                extractGridDescription(content.split("\n"))[0],
            ).toStrictEqual(expected);
        },
    );
});

describe("#tryParseBrickGrid", () => {
    it.each(validTests)(
        "generates expected brick grid (%s)",
        async (f, file) => {
            const content = await readFile(file + ".txt", {
                encoding: "utf-8",
            });
            const expected = (await import(file + ".grid.json").then(
                (module) => module.default,
            )) as string[][];
            expect(tryParseBrickGrid(content.split("\n")).grid).toStrictEqual(
                expected,
            );
        },
    );
    it("throws error for invalid brick grid cell", () => {
        const grid = "--x\n-b-\n-z-";
        expect(() => tryParseBrickGrid(grid.split("\n"))).toThrowError(/'z'/);
    });
});
