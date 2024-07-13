import { BLBDescriptor } from "../../types";
import { IHandlesParseState, TopParseState } from "../types";

export default class TopParseStateHandler
    implements IHandlesParseState<TopParseState>
{
    handles = "top" as const;
    state: TopParseState = {
        type: "top",
        parent: null,
        validationErrors: [],
    };
    next(): Promise<boolean> {
        return Promise.resolve(true);
    }
    fold<T extends BLBDescriptor = BLBDescriptor>(blb: T): Promise<T> {
        return Promise.resolve({ ...blb });
    }
}
