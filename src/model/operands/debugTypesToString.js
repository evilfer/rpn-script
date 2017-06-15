// @flow

import {TypeCheckContext} from '../base';
import type {ExprArityType, OperandType, OperandListType} from './types';
import {isUndefined} from './type-ops';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function idOf(i) {
    return (i >= LETTERS.length ? idOf(Math.floor(i / LETTERS.length)) : '') + LETTERS[i % LETTERS.length];
}

class TypeStringDebugger {
    nextId: number;

    constructor() {
        this.nextId = 0;
    }

    arityToString(arity: ExprArityType): string {
        let input = this.operandListToString(arity.input);
        let output = this.operandListToString(arity.output);
        let sep = input.length > 0 ? ' -> ' : '';
        return input + sep + output;
    }

    operandListToString(ops: OperandListType): string {
        return ops.map(op => this.operandToString(op)).join(' ');
    }

    operandTypeString(op: OperandType): string {
        switch (op.type) {
            case 'array':
                return `[${op.arrayType ? this.operandListToString(op.arrayType) : '?'}]`;
            case 'tuple':
                return `(${op.tupleTypes ? op.tupleTypes.map(tupleType => this.operandListToString(tupleType)).join(', ') : ''})`;
            default:
                return op.type;
        }
    }

    operandName(op: OperandType): string {
        if (isUndefined(op)) {
            if (!op.name) {
                op.name = idOf(this.nextId++);
            }
            return op.name  + ':';
        }

        return '';
    }

    operandToString(op: OperandType): string {
        return this.operandName(op) + this.operandTypeString(op);
    }
}

export default function debugTypeToString({input, output}: TypeCheckContext): string {
    let dt = new TypeStringDebugger();
    return dt.arityToString({input, output});
}
