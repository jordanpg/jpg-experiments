import { BLBDescriptor } from "../../types";
import { IHandlesParseState, ParseState } from "../types";

export default abstract class BaseParseStateHandler<S extends ParseState>
    implements IHandlesParseState<S>
{
    readonly handles: S["type"] = "top";
    abstract state: S;
    abstract next(line: string): Promise<boolean>;
    abstract fold<T extends BLBDescriptor = BLBDescriptor>(blb: T): Promise<T>;
    protected logError(message: string) {
        this.state.top?.validationErrors.push({
            from: this.handles,
            level: "error",
            message: `[ERROR] ${this.handles} : ${message}`,
        });
    }
    protected logWarning(message: string) {
        this.state.top?.validationErrors.push({
            from: this.handles,
            level: "warn",
            message: `[WARN] ${this.handles} : ${message}`,
        });
    }
    protected isComment(line: string) {
        return /^\s*\/\//m.test(line);
    }
    protected isEmpty(line: string) {
        return !line || !line.trim().length;
    }
    protected isSkippable(line: string) {
        return this.isEmpty(line) || this.isComment(line);
    }
}
