import {CodeToken} from "../code-token";
import {ExecNamespace} from "../exec/namespace";
import {Stack, StackValue} from "../exec/stack";
import {OperationType} from "../operands/operand-types";
import {popInputType, popTypeAndMatch, pushType} from "./process-types/basic-ops";
import {matchExpectedWrapped} from "./process-types/match-unwrap";
import {SingleTokenOperator} from "./single-token-operator";
import {OperatorList} from "./operator";
import execOpListOn from "../exec/exec-on";

export class UnwrapOperator extends SingleTokenOperator {
    public arity: null | { input: number, output: number };
    private isDefined: boolean;

    constructor(token: CodeToken) {
        super(token);

        const match = token.code.match(/}(?:([0-9]+):)?([0-9]+){/);
        if (match) {
            this.isDefined = true;
            this.arity = {
                input: match[1] ? parseInt(match[1], 10) : 0,
                output: parseInt(match[2], 10),
            };
        } else {
            this.isDefined = false;
            this.arity = null;
        }
    }

    public applyTypes(current: OperationType, namespace: { [p: string]: OperationType }): void {
        const typeId = popInputType(current);
        matchExpectedWrapped(current, typeId, this.arity);
        const type = current.types[typeId];

        if (type.wrapped) {
            [...type.wrapped.input].reverse().forEach(id => popTypeAndMatch(current, id));
            type.wrapped.output.forEach(id => pushType(current, id));
        }
    }

    public exec(stack: Stack, namespace: ExecNamespace): void {
        const operand: undefined | StackValue = stack.pop();
        if (operand) {
            const ops: OperatorList = operand.val as OperatorList;
            execOpListOn(ops, namespace, stack);
        }
    }
}
