import {SingleTokenOperator} from './operator';
import {Operator} from '../base';
import {CodeToken} from '../code-token';


export class ArgOperator extends SingleTokenOperator {
    arg: string;

    constructor(token: CodeToken) {
        super(token);
        this.arg = token.code;
    }

    applied<T>(args: { [key: string]: T }): Operator {
        return new AppliedArgOperator(this.token, args[this.arg]);
    }

    requiresArgs(): boolean {
        return true;
    }
}


export class AppliedArgOperator<T> extends SingleTokenOperator {
    operand: T;

    constructor(token: CodeToken, operand: T) {
        super(token);
        this.operand = operand;
    }
}
