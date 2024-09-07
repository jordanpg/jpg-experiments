import { describe, expect, it } from "vitest";
import { isCuboidBLB, isSpecialBLB } from "../../../src/blb/api/logic";
import { BLBDescriptor } from "../../../src/blb/types";

describe("#blbDescriptorDiscriminators", () => {
    it("categorizes cuboid", () => {
        const test: Partial<BLBDescriptor> = { type: "BRICK" };
        expect(isCuboidBLB(test)).toBeTruthy();
        expect(isSpecialBLB(test)).toBeFalsy();
    });
    it("categorizes special", () => {
        const test: Partial<BLBDescriptor> = { type: "SPECIAL" };
        expect(isCuboidBLB(test)).toBeFalsy();
        expect(isSpecialBLB(test)).toBeTruthy();
    });
});
