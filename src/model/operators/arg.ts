import {Operator, SingleTokenOperator} from './operator';
import {CodeToken} from '../code-token';
import {OperationType} from "../operands/operand-types";
import {ExecNamespace} from "../exec/namespace";
import {Stack} from "../exec/stack";


export class ArgOperator extends SingleTokenOperator {

    arg: string;

    constructor(token: CodeToken) {
        super(token);
        this.arg = token.code;
    }

    appliedTypeWithArgs(args: { [key: string]: number }): Operator {
        let arg: number = args[this.arg];
        if (typeof arg === 'undefined') {
            throw new Error('no arg!');
        } else {
            return new TypeAppliedArgOperator(this.token, args[this.arg]);
        }
    }

    requiresArgs(): boolean {
        return true;
    }

    applyTypes(current: OperationType, namespace: { [name: string]: OperationType }): void {
        throw new Error('not implemented');
    }

    exec(stack: Stack, namespace: ExecNamespace): void {
        throw new Error("not implemented");
    }
}


export abstract class AppliedArgOperator<T> extends SingleTokenOperator {
    operand: T;

    constructor(token: CodeToken, operand: T) {
        super(token);
        this.operand = operand;
    }
}

export class TypeAppliedArgOperator extends AppliedArgOperator<number> {
    applyTypes(current: OperationType, namespace: { [name: string]: OperationType }): void {
        current.output.push(this.operand);
    }

    exec(stack: Stack, namespace: ExecNamespace): void {
        throw new Error("not implemented");
    }
}
