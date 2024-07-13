import {
    BLBDescriptor,
    BLBType,
    BrickGrid,
    CoverageDescriptor,
    Quad,
    QuadsSide,
    Vector2f,
    Vector3f,
} from "../types.js";

export interface IHandlesParseState<S extends ParseState> {
    handles: S["type"];
    state: S;
    /**
     * Proceed parsing with the given line
     * @returns A promise which resolves to `true` if this handler has determined that its job is finished
     **/
    next(line: string): Promise<boolean>;
    /**
     * Fold this handler's state into the given {@link BLBDescriptor}
     * @returns A promise which resolves to a new {@link BLBDescriptor} containing this handler's mutations
     */
    fold<T extends BLBDescriptor = BLBDescriptor>(blb: T): Promise<T>;
}

export interface ParseStateHandlerConstructable<S extends ParseState> {
    new (parentState: S["parent"]): IHandlesParseState<S>;
}

export interface ParseStateBase {
    /** Identifier for the type of this state */
    type: unknown;
    /** Next state on the stack; i.e. the state within which we are nested. */
    parent: ParseState;
    top: TopParseState;
}

export interface ParseValidationError {
    from: ParseStateType;
    message: string;
    level?: "error" | "warn";
}

export interface TopParseState extends Omit<ParseStateBase, "parent" | "top"> {
    type: "top";
    parent?: null;
    top?: null;
    validationErrors: ParseValidationError[];
}

export interface HeadParseState extends ParseStateBase {
    type: "head";
    parent: TopParseState;
    /** Detected brick type */
    brickType?: BLBType;
    /** Detected brick bounds */
    bounds?: Vector3f;
}

export interface BrickGridParseState extends ParseStateBase {
    type: "grid";
    parent: TopParseState;
    /** Current brick grid */
    grid: BrickGrid;
    /** Current Y slice being parsed */
    currY: number;
    /** Current Z slice being parsed (within the current Y slice) */
    currZ: number;
}

export interface CoverageParseState extends ParseStateBase {
    type: "coverage";
    parent: TopParseState;
    /** Current parsed coverage information */
    coverage: Partial<CoverageDescriptor>;
    /**
     * Index of current size being parsed
     * @see {@link CoverageSides}
     * */
    currSide: number;
}

export interface QuadsParseState extends ParseStateBase {
    type: "quads";
    parent: TopParseState;
    /** Current quads side */
    side: QuadsSide;
    /** Parsed expected number of quads */
    numQuads: number;
}

export interface SingleQuadParseState extends ParseStateBase {
    type: "quad";
    parent: QuadsParseState;
    /** Current parsed quad */
    quad: Partial<Quad>;
}

export interface QuadTexParseState extends ParseStateBase {
    type: "quad-tex";
    parent: SingleQuadParseState;
}

export interface QuadPositionParseState extends ParseStateBase {
    type: "quad-pos";
    parent: SingleQuadParseState;
    /** Currently parsed vertex positions */
    verts: Vector3f[];
    /** Index of current vertex */
    currVertex: number;
}

export interface QuadColorsParseState extends ParseStateBase {
    type: "quad-col";
    parent: SingleQuadParseState;
    /** Currently parsed colors */
    colors: Vector3f[];
    /** Index of current color */
    currColor: number;
}

export interface QuadUVParseState extends ParseStateBase {
    type: "quad-uv";
    parent: SingleQuadParseState;
    /** Currently parsed UVs */
    uvs: Vector2f[];
    /** Index of current UV */
    currUV: number;
}

export interface QuadNormalsParseState extends ParseStateBase {
    type: "quad-norm";
    parent: SingleQuadParseState;
    /** Currently parsed normals */
    normals: Vector3f[];
    /** Index of current normal */
    currNormal: number;
}

export type ParseState =
    | TopParseState
    | HeadParseState
    | BrickGridParseState
    | CoverageParseState
    | QuadsParseState
    | SingleQuadParseState
    | QuadTexParseState
    | QuadPositionParseState
    | QuadColorsParseState;
export type ParseStateType = ParseState["type"];
