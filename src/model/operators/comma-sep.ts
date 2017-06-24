// @flow

import {MultipleTokenOperator} from './operator';
import {OperatorListType} from '../base';
//import {TypeCheckContext} from '../base';
//import {arrayType, tupleType} from '../operands/types';

export class ArrayOperator extends MultipleTokenOperator {
    cloneWith(appliedItems: OperatorListType[]): MultipleTokenOperator {
        return new ArrayOperator(this.tokens, appliedItems);
    }

    /*runTypeCheck(context: TypeCheckContext) {
     if (this.items.length === 0) {
     context.push(arrayType(null));
     } else {
     let subContext = new TypeCheckContext();
     this.items[0].forEach(op => op.runTypeCheck(subContext));
     context.push(arrayType(subContext.output));
     }
     }*/
}

export class TupleOperator extends MultipleTokenOperator {

    cloneWith(appliedItems: OperatorListType[]): MultipleTokenOperator {
        return new TupleOperator(this.tokens, appliedItems);
    }

    /*runTypeCheck(context: TypeCheckContext) {
     let tupleTypes = this.items.map((ops: OperatorListType) => {
     let subContext = new TypeCheckContext();
     ops.forEach(op => op.runTypeCheck(subContext));
     return subContext.output;
     });

     context.push(tupleType(tupleTypes));
     }*/
}

