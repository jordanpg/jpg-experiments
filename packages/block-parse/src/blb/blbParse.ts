import { Readable } from "stream";
import { tryParseBrickGrid } from "./api/brickGrid.js";
import tryParseCoverage from "./api/coverage.js";
import { tryParseHeader } from "./api/header.js";
import { isSpecialBLB } from "./api/logic.js";
import { tryParseAllQuads } from "./api/quad.js";
import { BLBDescriptor, SpecialDescriptor } from "./types.js";

function isReadable(val: any): val is Readable | NodeJS.ReadableStream {
    return Readable.isReadable(val);
}

function __fromString(str: string) {
    const lines = str.split(/\n/gm);
    return tryParseBlb(lines)[0];
}

export function tryParseBlb(lines: string[]) {
    let desc = {} as Partial<BLBDescriptor>;
    let workingLines = [...lines];

    function applyPhase<T extends Partial<BLBDescriptor>>(
        func: (lines: string[], blb?: T) => [T, string[]],
    ) {
        const [result, lines] = func(workingLines, desc as T);
        desc = result;
        workingLines = lines;
    }

    const phases = [tryParseHeader] as ((
        lines: string[],
        blb?: Partial<BLBDescriptor>,
    ) => [Partial<BLBDescriptor>, string[]])[];

    const specialPhases = [
        tryParseBrickGrid,
        tryParseCoverage,
        tryParseAllQuads,
    ] as ((
        lines: string[],
        blb?: Partial<SpecialDescriptor>,
    ) => [Partial<SpecialDescriptor>, string[]])[];

    try {
        for (const p of phases) {
            applyPhase(p);
        }
        if (isSpecialBLB(desc)) {
            for (const p of specialPhases) {
                applyPhase(p);
            }
        }
        return [desc as BLBDescriptor, workingLines] as const;
    } catch (err) {
        throw err;
    }
}

export default async function blbParse(
    content: string | NodeJS.ReadableStream,
) {
    // If we've been pased a Readable, then read it out and then parse the whole thing.
    // ? since BLB files are completely linear we can probably process the stream as it comes in... but they're small files so meh
    if (typeof content !== "string" && isReadable(content)) {
        const chunks: Buffer[] = [];
        for await (const chunk of content) {
            chunks.push(Buffer.from(chunk));
        }
        return __fromString(Buffer.concat(chunks).toString("utf-8"));
    }
    return __fromString(content);
}
