// @flow

import {SingleTokenOperator} from './operator';
import type {TokenType} from '../code-token';
import {TypeCheckContext} from '../base';
import {literalType} from '../operands/types';


class LiteralOperator<T> extends SingleTokenOperator {
    value: T;
    type: 'boolean' | 'number' | 'string';

    constructor(token: TokenType, type: 'boolean' | 'number' | 'string', value: T) {
        super(token);
        this.value = value;
        this.type = type;
    }

    runTypeCheck(context: TypeCheckContext) {
        context.push(literalType(this.type));
    }
}

export class NumberOperator extends LiteralOperator<number> {
    constructor(token: TokenType) {
        super(token, 'number', parseFloat(token.code));
    }
}

export class BooleanOperator extends LiteralOperator<boolean> {
    constructor(token: TokenType) {
        super(token, 'boolean', token.code === 'true');
    }
}

export class StringOperator extends LiteralOperator<string> {
    constructor(token: TokenType) {
        super(token, 'string', token.code.substr(1, token.code.length - 2));
    }
}
