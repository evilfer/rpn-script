// @flow

import {TypeCheckContext} from '../base';
import type {WrappedArityType, OperandType} from './types';


function operandToString(op: OperandType): string {
    switch (op.type) {
        default:
            return op.type;
    }
}

function operandListToString(ops: OperandType[]): string {
    return ops.map(operandToString).join('');
}

function arityToString(arity: WrappedArityType): string {
    let input = operandListToString(arity.input);
    let output = operandListToString(arity.output);
    let sep = input.length > 0 ? ' -> ' : '';
    return input + sep + output;
}

export default function debugTypeToString({input, output}: TypeCheckContext): string {
    return arityToString({input, output});
}
