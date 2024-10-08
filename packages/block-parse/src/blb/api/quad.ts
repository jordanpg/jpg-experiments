import type { Tuple } from "../../common/types.js";
import { parseVec } from "../../common/utils.js";
import type {
    FixedLengthArray,
    Quad,
    QuadPartHeaders,
    QuadsDescriptor,
    QuadsSide,
    SideQuadsDescriptor,
    SpecialDescriptor,
} from "../types.js";
import { QuadsSides, QuadTexTypes } from "../types.js";

export function tryParseFace<N extends number>(
    lines: string[],
    vectorLength: N,
): FixedLengthArray<Tuple<number, N>, 4>;
export function tryParseFace(lines: string[], vectorLength: number): number[][];
export function tryParseFace(lines: string[], vectorLength: number) {
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

function genericVectorList<N extends number>(
    lines: string[],
    name: string,
    len: N,
) {
    if (!lines?.length || lines.length < 5) {
        throw new Error(
            `Could not parse ${name}; expected at least 5 lines, got ${lines?.length}`,
        );
    }
    const [head, ...rest] = lines;
    if (!head?.includes(name)) {
        throw new Error(
            `Could not parse ${name}; header line is "${head}" instead`,
        );
    }

    return [rest.slice(4), tryParseFace<N>(rest, len)] as const;
}

export const QuadPartParse: Record<
    (typeof QuadPartHeaders)[number],
    (lines: string[], quad: Quad) => [string[], Quad]
> = {
    TEX: (lines, quad) => {
        if (!lines?.length) {
            throw new Error(`Could not parse TEX; no lines given!`);
        }
        const [l, ...rem] = lines;
        const tex = /TEX:(.+)$/m.exec(l!)?.[1]?.toUpperCase();
        if (!tex) {
            throw new Error(
                `Could not parse TEX; malformed texture line "${l}"`,
            );
        }
        const texType = Object.values(QuadTexTypes).find((v) => v === tex);
        if (!texType) {
            throw new Error(
                `Could not parse TEX; Unknown texture type "${tex}"`,
            );
        }

        return [
            rem,
            {
                ...quad,
                texture: texType,
            } as Quad,
        ] as const;
    },
    POSITION: (lines, quad) => {
        const [rem, result] = genericVectorList(lines, "POSITION", 3);
        return [
            rem,
            {
                ...quad,
                positions: result,
            },
        ];
    },
    COLORS: (lines, quad) => {
        const [rem, result] = genericVectorList(lines, "COLORS", 4);
        return [
            rem,
            {
                ...quad,
                colors: result,
            },
        ] as const;
    },
    "UV COORDS": (lines, quad) => {
        const [rem, result] = genericVectorList(lines, "UV COORDS", 2);
        return [
            rem,
            {
                ...quad,
                uvs: result,
            },
        ] as const;
    },
    NORMALS: (lines, quad) => {
        const [rem, result] = genericVectorList(lines, "NORMALS", 3);
        return [
            rem,
            {
                ...quad,
                normals: result,
            },
        ] as const;
    },
} as const;

export function tryParseQuad(lines: string[]): Quad | null {
    let firstContentLine = lines.findIndex((l) => l.trim().length);
    if (firstContentLine < 0) firstContentLine = 0;
    let nextEmptyLine = lines.findIndex(
        (l, idx) => idx > firstContentLine && !l.trim().length,
    );
    if (nextEmptyLine < 0) nextEmptyLine = lines.length;
    let useLines = lines.slice(firstContentLine, nextEmptyLine);

    if (!useLines?.length) {
        return null;
    }

    let quad = {} as Quad;

    // NOTE: so the actual BLB format is apparently kinda particular about the order of each quad section
    // i don't particularly care about mapping the real-world behavior of the BLB parser, but that is a divergence
    // so some BLB files that are invalid in Blockland could potentially be valid here
    while (useLines.length) {
        const part = /^([^:\n]+):/m.exec(
            useLines[0]!,
        )?.[1] as keyof typeof QuadPartParse;
        if (!part) {
            useLines.shift();
            continue;
        }
        if (!Object.keys(QuadPartParse).includes(part)) {
            throw new Error(`Unknown or unhandled quad part ${part} found`);
        }
        try {
            const [l, q] = QuadPartParse[part](useLines, quad);
            useLines = l;
            quad = q;
        } catch (err) {
            throw new Error(`Error parsing quad part ${part}: ${err}`);
        }
    }

    return quad;
}

export function tryParseQuadsSide(lines: string[]) {
    const startRgx = /^----------------([^\s]+) quads:/m;
    const firstLine = lines.findIndex((l) => startRgx.test(l));
    if (firstLine < 0) {
        throw new Error("No header found for quads section!");
    }
    const side = startRgx.exec(lines.at(firstLine)!)?.[1]?.toLowerCase() as
        | QuadsSide
        | undefined;
    if (!side || !QuadsSides.some((s) => s === side)) {
        throw new Error(`Cannot handle invalid quad side "${side}"`);
    }

    let lastLine = lines.findIndex(
        (l, idx) => idx > firstLine && startRgx.test(l),
    );
    if (lastLine < 0) lastLine = lines.length;
    let [head, num, ...useLines] = lines.slice(firstLine, lastLine);

    if (Number.isNaN(Number(num))) {
        throw new Error(
            `Expected number for quad count following header, got "${num}" instead`,
        );
    }

    const quads: SideQuadsDescriptor = Object.assign([] as Quad[], {
        side: side,
    });

    while (useLines.length) {
        // Find next non-whitespace line
        const f = useLines.findIndex((l) => l.trim().length);
        if (f < 0) {
            // If there are no more non-whitespace lines,
            break;
        }
        // Find next whitespace or quads-header line, or just use the rest of the lines
        let l = useLines.findIndex((l) => !l.trim().length || startRgx.test(l));
        if (l < 0) {
            l = useLines.length;
        }

        const quadLines = useLines.slice(f, l);
        useLines = useLines.slice(f + l);
        const q = tryParseQuad(quadLines);
        if (!q) {
            continue;
        }

        quads.push(q);
    }

    if (!isNaN(Number(num)) && quads.length !== Number(num)) {
        throw new Error(
            `Expected ${num} ${side} quads, got ${quads.length} instead!`,
        );
    }

    return [quads, lines.slice(lastLine)] as [SideQuadsDescriptor, string[]];
}

export function tryParseAllQuads(
    lines: string[],
    blb?: Partial<SpecialDescriptor>,
) {
    const desc = { ...blb };

    const quads = {} as Partial<QuadsDescriptor>;
    const pendingSides = new Set(QuadsSides);
    let workingLines = [...lines];
    while (workingLines.length) {
        const [result, l] = tryParseQuadsSide(workingLines);
        if (!pendingSides.has(result.side)) {
            throw new Error(
                `Got duplicate description for side "${result.side}" quads`,
            );
        }

        quads[result.side] = result;
        pendingSides.delete(result.side);
        workingLines = l;
    }

    if (pendingSides.size) {
        throw new Error(
            `Missing description for quad sides: ${[...pendingSides].join(", ")}`,
        );
    }

    desc.quads = quads as QuadsDescriptor;
    return [desc, workingLines];
}
