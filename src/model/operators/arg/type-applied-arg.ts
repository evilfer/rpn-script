import {ExecNamespace} from "../../exec/namespace";
import {Stack} from "../../exec/stack";
import {OperationType} from "../../operands/operand-types";
import {AppliedArgOperator} from "./applied-arg";

export class TypeAppliedArgOperator extends AppliedArgOperator<number> {
    public applyTypes(current: OperationType, namespace: { [name: string]: OperationType }): void {
        current.output.push(this.operand);
    }

    public exec(stack: Stack, namespace: ExecNamespace): void {
        throw new Error("not implemented");
    }
}
