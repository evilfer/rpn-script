// @flow

import type {OperandType, OperandContentType, OperatorListType} from '../base';
import {ExecutionContext} from '../base';

function operand(content: OperandContentType): OperandType {
    return {
        content,
        hasValue: content.value !== null
    };
}

export function anyType(): OperandContentType {
    return {type: 'any', value: null};
}

export function any(): OperandType {
    return {content: anyType(), hasValue: false};
}

export function number(value: ?number = null): OperandType {
    return operand({type: 'number', value});
}

export function string(value: ?string = null): OperandType {
    return operand({type: 'string', value});
}

export function boolean(value: ?boolean = null): OperandType {
    return operand({type: 'boolean', value});
}

/*export function tuple(value: ?ExecutionContext[] = null): OperandType {
 return operand({type: 'tuple', value});
 }

 export function array(value: ?string = null): OperandType {
 return operand({type: 'string', value});
 }*/

export function wrapped(value: ?OperatorListType = null): OperandType {
    return operand({type: 'wrapped', value, inputType: [], outputType: []});
}
