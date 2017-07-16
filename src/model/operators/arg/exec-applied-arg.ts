import {ExecNamespace} from "../../exec/namespace";
import {Stack, StackValue} from "../../exec/stack";
import {OperationType} from "../../operands/operand-types";
import {AppliedArgOperator} from "./applied-arg";

export class ExecAppliedArgOperator extends AppliedArgOperator<StackValue> {
    public applyTypes(current: OperationType, namespace: { [name: string]: OperationType }): void {
        throw new Error("not implemented");
    }

    public exec(stack: Stack, namespace: ExecNamespace): void {
        stack.push(this.operand);
    }
}
