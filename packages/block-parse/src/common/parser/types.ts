export interface IParseState {
    /** Identifier for the type of this state */
    type: string;
    /** Next state on the stack; i.e. the state within which we are nested. */
    parent?: IParseState;
}

export interface IHandlesParseState<S extends IParseState, R> {
    handles: S["type"];
    state: S;
    /**
     * Proceed parsing with the given line
     * @returns A promise which resolves to `true` if this handler has determined that its job is finished
     **/
    next(line: string): boolean;
    /**
     * Fold this handler's state into the given value
     * @returns A promise which resolves to a new valaue containing this handler's mutations
     */
    fold<T extends R = R>(blb: T): T;
}

export interface ParseStateHandlerConstructable<S extends IParseState, R> {
    new (parentState: S["parent"]): IHandlesParseState<S, R>;
}

export interface ParseContext<R, T extends ParseHandlerConfiguration<R>> {
    config: T;
    stack: ParseStack<R, T>;
    /** Reference to the top-level parse state */
    top?: ParseState<R, T>;
    getCurrentRoot(): R;
    pushState<P extends ParseState<R, T>>(
        state: ChildParseState<R, T, P>,
    ): ParseStack<R, T>;
}

interface ParseHandlerConfigurationBase<R = any> {
    handlers: ParseHandlersForRoot<R>;
}

interface ParseHandlerConfigurationWithInitialRoot<R = any>
    extends ParseHandlerConfigurationBase<R> {
    initialRoot: R;
}

interface ParseHandlerConfigurationWithRootConstructor<R = any>
    extends ParseHandlerConfigurationBase<R> {
    rootConstructor: RootConstructor<R>;
}

export type ParseHandlerConfiguration<Root = any> =
    | ParseHandlerConfigurationWithInitialRoot<Root>
    | ParseHandlerConfigurationWithRootConstructor<Root>;

export type RootValue<T> = T extends Function ? never : T;
export type ParseHandlersForRoot<R> = Record<
    string,
    IHandlesParseState<IParseState, R>
>;
export type ParseHandlerTypes<
    R,
    T extends ParseHandlerConfiguration<R>,
> = keyof T["handlers"];
export type ParseHandler<
    R,
    T extends ParseHandlerConfiguration<R>,
> = T["handlers"][string];
export type ChildParseState<
    R,
    C extends ParseHandlerConfiguration<R>,
    T extends ParseState<R, C>,
> = ParseState<R, C> & { parent: T };
export type ParseState<R, T extends ParseHandlerConfiguration<R>> = T extends {
    handlers: Record<string, IHandlesParseState<infer S, R>>;
}
    ? S
    : never;
export type ContextConfiguration<C> =
    C extends ParseContext<any, infer H> ? H : never;
export type ContextRoot<C> = C extends ParseContext<infer R, any> ? R : never;
export type RootConstructor<R> = (config: ParseHandlerConfiguration<R>) => R;
export type ParseStack<R, T extends ParseHandlerConfiguration<R>> = ParseState<
    R,
    T
>[];

export interface ParseValidationError {
    from: string;
    message: string;
    level?: "error" | "warn";
}
