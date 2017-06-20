// @flow

import {MultipleTokenOperator} from './operator';
import {TypeCheckContext} from '../base';
import type {OperatorListType} from '../base';
import {arrayType, tupleType} from '../operands/types';

export class ArrayOperator extends MultipleTokenOperator {

    runTypeCheck(context: TypeCheckContext) {
        if (this.items.length === 0) {
            context.push(arrayType(null));
        } else {
            let subContext = new TypeCheckContext();
            this.items[0].forEach(op => op.runTypeCheck(subContext));
            context.push(arrayType(subContext.output));
        }
    }
}

export class TupleOperator extends MultipleTokenOperator {

    runTypeCheck(context: TypeCheckContext) {
        let tupleTypes = this.items.map((ops: OperatorListType) => {
            let subContext = new TypeCheckContext();
            ops.forEach(op => op.runTypeCheck(subContext));
            return subContext.output;
        });

        context.push(tupleType(tupleTypes));
    }
}

