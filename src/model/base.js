// @flow

import type {OperandType} from './operands/types';
import {anyType} from './operands/types';
import {RpnError} from './errors';

export type OperatorListType = Operator[];


export class ExecutionContext<T> {
    output: T[];
    input: T[];

    constructor() {
        this.input = [];
        this.output = [];
    }

    push(item: T) {
        this.output.push(item);
    }

    pop(): T {
        if (this.output.length > 0) {
            return this.output.pop();
        } else {
            let item = this.createInputElement();
            this.input.unshift(item);
            return item;
        }
    }

    createInputElement(): T {
        throw new Error('createInputElement not implemented');
    }
}

export class TypeCheckContext extends ExecutionContext<OperandType> {

    createInputElement(): OperandType {
        return anyType();
    }
}

export class OutputContext extends ExecutionContext<boolean> {
    createInputElement(): boolean {
        throw new Error('createInputElement disallowed when computing expression output');
    }
}


export class Operator {
    errors: RpnError[];

    constructor() {
        this.errors = [];
    }

    applied<T>(args: { [string]: T }): Operator {
        return this;
    }

    requiresArgs(): boolean {
        return false;
    }

    runTypeCheck(context: TypeCheckContext) {
        throw new Error('runTypeCheck not implemented');
    }
}
