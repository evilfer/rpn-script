import {MultipleTokenOperator} from './operator';
import {OperatorListType} from '../base';
import {CodeToken} from '../code-token';
import {OperationType, TypeArity} from "../operands/operand-types";
import {arityFromSubToMain, pushOutputMemberTypes, runTypeCheck} from "./run-type-check";


export class WrappedOperator extends MultipleTokenOperator {

    expr: OperatorListType;

    cloneWith(appliedItems: OperatorListType[]): MultipleTokenOperator {
        return new WrappedOperator(this.tokens, appliedItems);
    }

    constructor(tokens: CodeToken[], items: OperatorListType[]) {
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

}
