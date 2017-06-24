import {MultipleTokenOperator} from './operator';
import {OperatorListType} from '../base';
import {CodeToken} from '../code-token';


export class WrappedOperator extends MultipleTokenOperator {
    cloneWith(appliedItems: OperatorListType[]): MultipleTokenOperator {
        return new WrappedOperator(this.tokens, appliedItems);
    }

    expr: OperatorListType;

    constructor(tokens: CodeToken[], items: OperatorListType[]) {
        super(tokens, items);
        this.expr = items.length > 0 ? items[0] : [];
    }
}
