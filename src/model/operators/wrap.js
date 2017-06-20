// @flow

import {MultipleTokenOperator} from './operator';
import type {OperatorListType} from './operator';
import type {TokenType} from '../code-token';


export class WrappedOperator extends MultipleTokenOperator {
    expr: OperatorListType;

    constructor(tokens: TokenType[], items: OperatorListType[]) {
        super(tokens, items);
        this.expr = items.length > 0 ? items[0] : [];
    }
}
