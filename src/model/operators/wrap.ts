import {CodeToken} from "../code-token";
import {ExecNamespace} from "../exec/namespace";
import {Stack} from "../exec/stack";
import {OperationType, TypeArity} from "../operands/operand-types";
import {MultipleTokenOperator} from "./multiple-token-operator";
import {OperatorList} from "./operator";
import {arityFromSubToMain} from "./process-types/add-sub-main";
import {pushOutputMemberTypes} from "./process-types/basic-ops";
import {runTypeCheck} from "./process-types/run-type-check";

export class WrappedOperator extends MultipleTokenOperator {
    protected expr: OperatorList;

    constructor(tokens: CodeToken[], items: OperatorList[]) {
        super(tokens, items);
        this.expr = items.length > 0 ? items[0] : [];
    }

    public cloneWith(appliedItems: OperatorList[]): MultipleTokenOperator {
        return new WrappedOperator(this.tokens, appliedItems);
    }

    public applyTypes(current: OperationType, namespace: { [name: string]: OperationType; }): void {
        const wrappedArity: TypeArity = arityFromSubToMain(current, runTypeCheck(this.expr, namespace));

        pushOutputMemberTypes(current, {
            type: "wrapped",
            wrapped: wrappedArity,
        });
    }

    public exec(stack: Stack, namespace: ExecNamespace): void {
        stack.push({
            val: this.expr,
        });
    }
}
