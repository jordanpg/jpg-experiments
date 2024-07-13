import { BLBDescriptor, BLBTypes, Vector3f } from "../../types";
import { HeadParseState } from "../types";
import BaseParseStateHandler from "./base";

export default class HeadParseStateHandler extends BaseParseStateHandler<HeadParseState> {
    handles = "head" as const;
    state: HeadParseState;
    constructor(parentState: HeadParseState["parent"]) {
        super();

        this.state = {
            type: "head",
            parent: parentState,
            top: parentState,
        };
    }

    next(line: string): Promise<boolean> {
        if (!this.state.bounds) {
            return Promise.resolve(this.#tryParseBounds(line));
        }

        if (!this.state.brickType) {
            return Promise.resolve(this.#tryParseBrickType(line));
        }

        return Promise.resolve(true);
    }

    fold<T extends BLBDescriptor = BLBDescriptor>(blb: T): Promise<T> {
        return Promise.resolve({
            ...blb,
            type: this.state.brickType,
            size: this.state.bounds,
        });
    }

    #tryParseBounds(line: string) {
        if (this.isSkippable(line)) {
            return false;
        }
        const nums = line.split(" ").map((i) => Math.floor(Number(i)));
        if (nums.length < 3) {
            this.logError(
                `No bounds provided! Expected 3 integers, got "${line}"`,
            );
            this.state.bounds = [0, 0, 0];
        } else {
            this.state.bounds = nums.slice(3) as Vector3f;
        }
        return false;
    }

    #tryParseBrickType(line: string) {
        if (this.isSkippable(line)) {
            return false;
        }

        for (const type of Object.values(BLBTypes)) {
            if (line === type) {
                this.state.brickType = line;
                break;
            }
        }

        return false;
    }
}
