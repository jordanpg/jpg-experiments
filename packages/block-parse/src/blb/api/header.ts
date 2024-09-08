import { parseVec } from "../../common/utils.js";
import type { BLBDescriptor } from "../types.js";
import { BLBTypes } from "../types.js";

export function tryParseHeader(
    input: string[],
    blb?: Partial<BLBDescriptor>,
): [Partial<BLBDescriptor>, string[]] {
    const desc: Partial<BLBDescriptor> = { ...blb };

    const lines = [...input];
    while (lines.length > 0) {
        const line = lines.shift();
        if (!line || line.trim() === "") {
            continue;
        }

        if (!desc.size) {
            desc.size = parseVec(line, 3);
            continue;
        }

        for (const t in BLBTypes) {
            const type = BLBTypes[t as keyof typeof BLBTypes];
            if (line.trim() === type) {
                desc.type = type;
                return [desc as BLBDescriptor, lines];
            }
            /* v8 ignore next 4 */
        }
        // If we get here without already returning a fully-formed descriptor, then something is very wrong.
        break;
    }
    throw new SyntaxError("Malformed or incomplete BLB header");
}
