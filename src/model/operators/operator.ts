import {RpnError} from "../errors";
import {ExecNamespace} from "../exec/namespace";
import {Stack, StackValue} from "../exec/stack";
import {OperationType} from "../operands/operand-types";

export type OperatorList = Operator[];

export abstract class Operator {
    public errors: RpnError[];

    constructor() {
        this.errors = [];
    }

    public appliedTypeWithArgs(args: { [key: string]: number }): Operator {
        return this;
    }

    public appliedExecWithArgs(args: { [key: string]: StackValue }): Operator {
        return this;
    }

    public requiresArgs(): boolean {
        return false;
    }

    public abstract applyTypes(current: OperationType, namespace: { [name: string]: OperationType }): void;

    public abstract exec(stack: Stack, namespace: ExecNamespace): void;
}
