// @flow

import type {OperandType, OperandListType} from './types';


export function isUndefined(item: OperandType): boolean {
    switch (item.type) {
        case 'any':
            return true;

        case 'array':
            return !item.arrayType || item.arrayType.some(isUndefined);

        case 'tuple':
            return !item.tupleTypes || item.tupleTypes.some(item => item.some(isUndefined));

        default:
            return false;
    }
}
