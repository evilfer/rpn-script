import {SingleTokenOperator} from './operator';
import {CodeToken} from '../code-token';
import {OperationType} from "../operands/operand-types";
//import {TypeCheckContext} from '../base';
//import {literalType} from '../operands/types';


export class LiteralOperator<T> extends SingleTokenOperator {
    value: T;
    type: 'boolean' | 'number' | 'string';

    constructor(token: CodeToken, type: 'boolean' | 'number' | 'string', value: T) {
        super(token);
        this.value = value;
        this.type = type;
    }

    getType(): OperationType {
        return {
            input: [],
            output: [0],
            types: {
                0: {
                    type: this.type
                }
            }
        };
    }
}

export class NumberOperator extends LiteralOperator<number> {
    constructor(token: CodeToken) {
        super(token, 'number', parseFloat(token.code));
    }
}

export class BooleanOperator extends LiteralOperator<boolean> {
    constructor(token: CodeToken) {
        super(token, 'boolean', token.code === 'true');
    }
}

export class StringOperator extends LiteralOperator<string> {
    constructor(token: CodeToken) {
        super(token, 'string', token.code.substr(1, token.code.length - 2));
    }
}
