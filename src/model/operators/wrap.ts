import {MultipleTokenOperator, OperatorList} from './operator';
import {CodeToken} from '../code-token';
import {OperationType, TypeArity} from "../operands/operand-types";
import {arityFromSubToMain} from "./process-types/add-sub-main";
import {runTypeCheck} from "./process-types/run-type-check";
import {pushOutputMemberTypes} from "./process-types/basic-ops";
import {Stack} from "../exec/stack";
import {ExecNamespace} from "../exec/namespace";


export class WrappedOperator extends MultipleTokenOperator {

    expr: OperatorList;

    cloneWith(appliedItems: OperatorList[]): MultipleTokenOperator {
        return new WrappedOperator(this.tokens, appliedItems);
    }

    constructor(tokens: CodeToken[], items: OperatorList[]) {
        super(tokens, items);
        this.expr = items.length > 0 ? items[0] : [];
    }

    applyTypes(current: OperationType, namespace: { [name: string]: OperationType; }): void {
        let wrappedArity: TypeArity = arityFromSubToMain(current, runTypeCheck(this.expr, namespace));

        pushOutputMemberTypes(current, {
            type: 'wrapped',
            wrapped: wrappedArity
        });
    }

    exec(stack: Stack, namespace: ExecNamespace): void {
        stack.push({
            val: this.expr
        });
    }
}
