import {SingleTokenOperator} from './operator';
import {Operator} from '../base';
import {CodeToken} from '../code-token';
import {OperandType, OperationType} from "../operands/operand-types";


export class ArgOperator extends SingleTokenOperator {
    arg: string;

    constructor(token: CodeToken) {
        super(token);
        this.arg = token.code;
    }

    appliedType(args: { [key: string]: OperandType }): Operator {
        let arg: OperandType = args[this.arg];
        if (typeof arg === 'undefined') {
            throw new Error('no arg!');
        } else {
            return new TypeAppliedArgOperator(this.token, args[this.arg]);
        }
    }

    requiresArgs(): boolean {
        return true;
    }

    getType(): OperationType {
        throw new Error('not implemented');
    }
}


export abstract class AppliedArgOperator<T> extends SingleTokenOperator {
    operand: T;

    constructor(token: CodeToken, operand: T) {
        super(token);
        this.operand = operand;
    }
}

export class TypeAppliedArgOperator extends AppliedArgOperator<OperandType> {
    getType(current: OperationType): OperationType {
        return {
            input: [],
            output: [0],
            types: {
                0: this.operand
            }
        };
    }
}
