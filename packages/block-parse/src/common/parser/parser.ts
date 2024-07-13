import {
    ChildParseState,
    ParseContext,
    ParseHandlerConfiguration,
    ParseStack,
    ParseState,
} from "./types.js";

export abstract class ParserBase<R, T extends ParseHandlerConfiguration<R>> {
    context: ParseContext<R, T>;
    protected root: R;
    constructor(config: T) {
        if ("initialRoot" in config) {
            this.root = config.initialRoot;
        } else if ("rootConstructor" in config) {
            this.root = config.rootConstructor(config);
        } else {
            throw new Error(
                "Configuration must provide a way to initialize the root value!",
            );
        }

        this.context = this.initContext(config);
    }

    protected getRoot(): R {
        return this.root;
    }

    protected pushState<P extends ParseState<R, T>>(
        state: ChildParseState<R, T, P>,
    ): ParseStack<R, T> {
        return [...this.context.stack, state];
    }

    protected initContext(config: T): ParseContext<R, T> {
        return {
            config: config,
            stack: [],
            getCurrentRoot: () => this.getRoot(),
            pushState: (state) => this.pushState(state),
        };
    }
}
