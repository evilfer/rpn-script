import {OperationType} from "../../operands/operand-types";

export function nextId(opty: OperationType): number {
    const ids: number[] = Object.keys(opty.types).map(v => parseInt(v, 10));
    return Math.max(0, Math.max.apply(null, ids) + 1);
}
