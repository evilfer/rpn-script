import {RpnError} from './errors';
import {OperandType, OperationType} from "./operands/operand-types";

export type OperatorListType = Operator[];

export abstract class Operator {
    errors: RpnError[];

    constructor() {
        this.errors = [];
    }

    appliedType(args: { [key: string]: OperandType }): Operator {
        return this;
    }


    requiresArgs(): boolean {
        return false;
    }

    abstract getType(current: OperationType, namespace: { [name: string]: OperationType }): OperationType;
}
