// @flow
import {Error} from './errors';
import type CodeToken from './code-token';

export class Operator {
    errors: Error[];

    constructor() {
        this.errors = [];
    }
}

class SingleTokenOperator extends Operator {
    token: CodeToken;

    constructor(token: CodeToken) {
        super();
        this.token = token;
    }
}

class LiteralOperator<T> extends SingleTokenOperator {
    value: T;
    type: string;

    constructor(token: CodeToken, type: string, value: T) {
        super(token);
        this.value = value;
    }
}

class NumberOperator extends LiteralOperator<number> {
    constructor(token: CodeToken) {
        super(token, 'number', parseFloat(token.code));
    }
}

class BooleanOperator extends LiteralOperator<boolean> {
    constructor(token: CodeToken) {
        super(token, 'boolean', token.code === 'true');
    }
}

class StringOperator extends LiteralOperator<boolean> {
    constructor(token: CodeToken) {
        super(token, 'string', token.code.substr(1, token.code.length - 2));
    }
}

export class UnwrapOperator extends SingleTokenOperator {
}


export class RefOperator extends SingleTokenOperator {
    ref: string;

    constructor(token: CodeToken) {
        super(token);
        this.ref = token.code;
    }
}

class MultipleTokenOperator extends Operator {
    tokens: CodeToken[];

    constructor(tokens: CodeToken[]) {
        super();
        this.tokens = tokens;
    }
}

class CommaSeparatedMultipleTokenOperator extends MultipleTokenOperator {
    items: OperatorList[];

    constructor(tokens: CodeToken[]) {
        super(tokens);
        let rest = tokens.slice(1, -1);

        this.items = [];

        while (rest.length > 0) {
            let index = rest.findIndex(({type}) => type === 'sep');
            let sep = index >= 0 ? index : rest.length;

            this.items.push(createOperators(rest.slice(0, sep)));
            rest = rest.slice(sep + 1);
        }
    }
}

export class ArrayOperator extends CommaSeparatedMultipleTokenOperator {

}

export class TupleOperator extends CommaSeparatedMultipleTokenOperator {
}

export class WrappedOperator extends MultipleTokenOperator {
    expr: OperatorList;

    constructor(tokens: CodeToken[]) {
        super(tokens);
        this.expr = createOperators(tokens.slice(1, -1));
    }
}


export type OperatorList = Operator[];


const MULTIPLE_OPTS = {
    'wrapOpen': WrappedOperator,
    'arrayOpen': ArrayOperator,
    'tupleOpen': TupleOperator
};

const SINGLE_OPTS = {
    'unwrap': UnwrapOperator,
    'number': NumberOperator,
    'string': StringOperator,
    'boolean': BooleanOperator,
    'ref': RefOperator
};

export function createOperators(rhs: CodeToken[]): OperatorList {
    let operators = [];

    for (let i = 0; i < rhs.length; i++) {
        let operator = null;
        let token = rhs[i];
        if (MULTIPLE_OPTS[token.type]) {
            let closingIndex = rhs.indexOf(token.match);
            let tokens = rhs.slice(i, closingIndex + 1);
            operator = new (MULTIPLE_OPTS[token.type])(tokens);
            i = closingIndex;
        } else if (SINGLE_OPTS[token.type]) {
            operator = new (SINGLE_OPTS[token.type])(token);
        }

        if (operator) {
            operators.push(operator);
        }
    }

    return operators;
}
