import {OperationType} from "../../operands/operand-types";

export function nextId(opty: OperationType): number {
    let ids: number[] = Object.keys(opty.types).map(v => parseInt(v));
    return Math.max(0, Math.max.apply(null, ids) + 1);
}
