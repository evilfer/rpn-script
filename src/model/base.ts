import {RpnError} from './errors';
import {OperationType} from "./operands/operand-types";

export type OperatorListType = Operator[];

export abstract class Operator {
    errors: RpnError[];

    constructor() {
        this.errors = [];
    }

    appliedTypeWithArgs(args: { [key: string]: number }): Operator {
        return this;
    }


    requiresArgs(): boolean {
        return false;
    }

    abstract applyTypes(current: OperationType, namespace: { [name: string]: OperationType }): void;
}
