/** Data definitions for BLB files */

/** Representation of fxDTSBrick datablock */
export interface fxDTSBrick {
    name: string;
    brickFile: string;
    collisionShapeName: string;
    category: string;
    subCategory: string;
    uiName: string;
    iconName: string;

    blb?: BLBDescriptor;
}

// #region Top-level types
export interface BaseDescriptor {
    size: [x: number, y: number, z: number];
    type: BLBType;
}

export interface BrickDescriptor extends BaseDescriptor {
    type: "BRICK";
}

export interface SpecialDescriptor extends BaseDescriptor {
    type: "SPECIAL";
    coverage: CoverageDescriptor;
    grid: BrickGrid;
}

export type BLBDescriptor = BrickDescriptor | SpecialDescriptor;

export const BLBTypes = {
    Brick: "BRICK",
    Special: "SPECIAL",
} as const;
export type BLBType = (typeof BLBTypes)[keyof typeof BLBTypes];
// #endregion

// #region Coverage types
export type CoverageDescriptor = Record<CoverageSide, Coverage>;
/** Coverage description for a single face */
export interface Coverage {
    /** If true, adjacent faces should be culled */
    cullAdjacent: boolean;
    /** Coverage area of an adjacent brick needed to hide this face */
    area: number;
}

export const CoverageSides = [
    "top",
    "bottom",
    "north",
    "east",
    "south",
    "west",
] as const;
export type CoverageSide = (typeof CoverageSides)[number];
// #endregion

// #region Brick Grid types
/** Defines behavior for brick placement for a grid position within the brick bounds */
export const BrickGridCellType = {
    /** Restrict placing inside, above, and below this cell */
    RestrictAll: "x",
    /** Allow placing inside this cell */
    Empty: "-",
    /** Allow placing bricks atop this cell */
    AllowTop: "u",
    /** Allow placing bricks below this cell */
    AllowBelow: "d",
    /** Allow placing bricks above or below this cell */
    AllowBoth: "b",
} as const;
export type BrickGridCell =
    (typeof BrickGridCellType)[keyof typeof BrickGridCellType];
/** Single brick grid slice on XZ plane */
export type BrickGridSlice = BrickGridCell[][];
/** Collection of each grid slice along the Y axis */
export type BrickGrid = BrickGridSlice[];
// #endregion

// #region Quads types
export type QuadsDescriptor = Record<QuadsSide, SideQuadsDescriptor>;
export const QuadsSides = [...CoverageSides, "omni"] as const;
export type QuadsSide = (typeof QuadsSides)[number];

export interface SideQuadsDescriptor extends Array<Quad> {
    side: QuadsSide;
}

export interface Quad {
    texture: QuadTexType;
    positions: FixedLengthArray<Vector3f, 4>;
    colors?: FixedLengthArray<Vector4f, 4>;
    uvs: FixedLengthArray<Vector2f, 4>;
    normals: FixedLengthArray<Vector3f, 4>;
}

export const QuadTexTypes = {
    Top: "TOP",
    BottomLoop: "BOTTOMLOOP",
    BottomEdge: "BOTTOMEDGE",
    Side: "SIDE",
    Ramp: "RAMP",
    Print: "PRINT",
} as const;
export type QuadTexType = (typeof QuadTexTypes)[keyof typeof QuadTexTypes];

export type FixedLengthArray<T, W> = Array<T> & { length: W };
export type Vector2f = [number, number];
export type Vector3f = [number, number, number];
export type Vector4f = [number, number, number, number];
// #endregion
