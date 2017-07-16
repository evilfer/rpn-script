import {CodeToken} from "../../code-token";
import {ExecNamespace} from "../../exec/namespace";
import {Stack, StackValue} from "../../exec/stack";
import {OperationType} from "../../operands/operand-types";
import {Operator} from "../operator";
import {SingleTokenOperator} from "../single-token-operator";
import {ExecAppliedArgOperator} from "./exec-applied-arg";
import {TypeAppliedArgOperator} from "./type-applied-arg";

export class ArgOperator extends SingleTokenOperator {
    public arg: string;

    constructor(token: CodeToken) {
        super(token);
        this.arg = token.code;
    }

    public appliedTypeWithArgs(args: { [key: string]: number }): Operator {
        const arg: number = args[this.arg];
        if (typeof arg === "undefined") {
            throw new Error("no arg!");
        } else {
            return new TypeAppliedArgOperator(this.token, args[this.arg]);
        }
    }

    public appliedExecWithArgs(args: { [key: string]: StackValue }): Operator {
        const arg: StackValue = args[this.arg];
        if (typeof arg === "undefined") {
            throw new Error("no arg!");
        } else {
            return new ExecAppliedArgOperator(this.token, args[this.arg]);
        }
    }

    public requiresArgs(): boolean {
        return true;
    }

    public applyTypes(current: OperationType, namespace: { [name: string]: OperationType }): void {
        throw new Error("not implemented");
    }

    public exec(stack: Stack, namespace: ExecNamespace): void {
        throw new Error("not implemented");
    }
}
