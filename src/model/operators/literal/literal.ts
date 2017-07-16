import {CodeToken} from "../../code-token";
import {ExecNamespace} from "../../exec/namespace";
import {Stack} from "../../exec/stack";
import {OperationType} from "../../operands/operand-types";
import {pushOutputMemberTypes} from "../process-types/basic-ops";
import {SingleTokenOperator} from "../single-token-operator";

export class LiteralOperator<T extends boolean | number | string> extends SingleTokenOperator {

    public value: T;
    public type: "boolean" | "number" | "string";

    constructor(token: CodeToken, type: "boolean" | "number" | "string", value: T) {
        super(token);
        this.value = value;
        this.type = type;
    }

    public applyTypes(current: OperationType, namespace: { [name: string]: OperationType }): void {
        pushOutputMemberTypes(current, {
            type: this.type,
        });
    }

    public exec(stack: Stack, namespace: ExecNamespace): void {
        stack.push({val: this.value});
    }
}
