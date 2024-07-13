import { BLBDescriptor, BrickDescriptor, SpecialDescriptor } from "../types.js";

export function isCuboidBLB(desc: BLBDescriptor): desc is BrickDescriptor;
export function isCuboidBLB(
    desc: Partial<BLBDescriptor>,
): desc is Partial<BrickDescriptor>;
export function isCuboidBLB(
    desc: Partial<BLBDescriptor>,
): desc is Partial<BrickDescriptor> {
    return desc.type === "BRICK";
}

export function isSpecialBLB(desc: BLBDescriptor): desc is SpecialDescriptor;
export function isSpecialBLB(
    desc: Partial<BLBDescriptor>,
): desc is Partial<SpecialDescriptor>;
export function isSpecialBLB(
    desc: Partial<BLBDescriptor>,
): desc is Partial<SpecialDescriptor> {
    return desc.type === "SPECIAL";
}
