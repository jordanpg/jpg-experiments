import {
    BrickGrid,
    BrickGridCell,
    BrickGridCellType,
    SpecialDescriptor,
} from "../types.js";

export function extractGridDescription(lines: string[]) {
    const firstContentLine = lines.findIndex((l) => l.trim().length > 0);
    const zeroLine = lines.findIndex((l) => l.trim() === "0") - 1; // minus one for leading newline
    const groups = lines
        .slice(firstContentLine, zeroLine > -1 ? zeroLine : undefined)
        .reduce(
            (prev: string[][], curr: string) => {
                // Pop the working group off the top
                const grp = prev.pop() ?? [];

                // Blank lines signify that a new group is beginning
                if (curr.trim().length < 1) {
                    return [...prev, grp, []] as string[][];
                }

                // Add this line to the working group
                return [...prev, [...grp, curr.trim()]] as string[][];
            },
            [[]] as string[][],
        );
    return [groups, zeroLine] as const;
}

export function tryParseBrickGrid(
    lines: string[],
    blb?: Partial<SpecialDescriptor>,
) {
    const desc = { ...blb };
    const [groups, gridEnd] = extractGridDescription(lines);

    const grid: BrickGrid = groups.map((g) =>
        g.map((l) =>
            l.split("").map((c) => {
                const cell =
                    BrickGridCellType[
                        Object.keys(BrickGridCellType).find(
                            (i) =>
                                BrickGridCellType[
                                    i as keyof typeof BrickGridCellType
                                ] === c.toLowerCase(),
                        ) as keyof typeof BrickGridCellType
                    ];
                if (cell == undefined) {
                    throw new Error(
                        `Found invalid character in brick grid '${c}'`,
                    );
                }
                return cell as BrickGridCell;
            }),
        ),
    );
    desc.grid = grid;

    return desc;
}
