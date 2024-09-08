import type {
    Coverage,
    CoverageDescriptor,
    SpecialDescriptor} from "../types.js";
import {
    CoverageSides
} from "../types.js";

export function parseSideCoverage(line: string): Coverage | null {
    const match = /(\d+)\s*:\s*(\d)/.exec(line);
    if (match == null) {
        return null;
    }
    return {
        cullAdjacent: match[1] === "1",
        area: Number(match[2]),
    };
}

/** Expects coverage data will be in the six lines immediately after a "COVERAGE:" line */
export default function tryParseCoverage(
    lines: string[],
    blb?: Partial<SpecialDescriptor>,
) {
    const desc = { ...blb };
    const startIdx = lines.findIndex((l) => /COVERAGE:/.test(l.trim()));
    if (startIdx < 0) {
        throw new Error("No COVERAGE header found in coverage data");
    }
    const coverageLines = lines.slice(startIdx + 1, startIdx + 7);
    const coverage = {} as CoverageDescriptor;
    coverageLines.forEach((l, idx) => {
        const side = CoverageSides[idx]!;
        const c = parseSideCoverage(l);
        if (c == null) {
            throw new Error(
                `Expected coverage description for side "${side}," but got "${l}"`,
            );
        }
        coverage[side] = c;
    });
    desc.coverage = coverage;
    return [desc, lines.slice(startIdx + 7)] as [
        Partial<SpecialDescriptor>,
        string[],
    ];
}
