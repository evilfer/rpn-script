// @flow

import type {TokenType} from '../code-token';
import {Operator} from '../base';
import type {OperatorListType} from '../base';

export class SingleTokenOperator extends Operator {
    token: TokenType;

    constructor(token: TokenType) {
        super();
        this.token = token;
    }
}


export class MultipleTokenOperator extends Operator {
    tokens: TokenType[];
    items: OperatorListType[];
    childrenRequireArgs: boolean[];
    argsRequired: boolean;

    constructor(tokens: TokenType[], items: OperatorListType[]) {
        super();
        this.tokens = tokens;
        this.items = items;

        this.childrenRequireArgs = items.map(list => list.some(token => token.requiresArgs()));
        this.argsRequired = this.childrenRequireArgs.some(v => v);
    }

    applied<T>(args: { [string]: T }): Operator {
        if (!this.argsRequired) {
            return this;
        }

        let appliedItems: OperatorListType[] = this.items.map((item, i) => this.childrenRequireArgs[i] ?
            item.map(op => op.applied(args)) :
            item
        );

        return new (this.constructor)(this.tokens, appliedItems);
    }

    requiresArgs(): boolean {
        return this.argsRequired;
    }
}
