// @flow

import {MultipleTokenOperator} from './operator';
import {TypeCheckContext} from '../base';
import {arrayType, anyType} from '../operands/types';

export class ArrayOperator extends MultipleTokenOperator {
    runTypeCheck(context: TypeCheckContext) {
        if (this.items.length === 0) {
            return arrayType(null);
        }

        let subContext = new TypeCheckContext();
        this.items[0].forEach(op => op.runTypeCheck(subContext));
        return arrayType({input: subContext.input, output: subContext.output});
    }
}

export class TupleOperator extends MultipleTokenOperator {
}

