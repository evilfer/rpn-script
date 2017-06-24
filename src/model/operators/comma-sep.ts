// @flow

import {MultipleTokenOperator} from './operator';
import {OperatorListType} from '../base';
import {OperationType, TypeArity} from "../operands/operand-types";
import {arityFromSubToMain, pushOutputMemberTypes, runTypeCheck} from "./run-type-check";
//import {TypeCheckContext} from '../base';
//import {arrayType, tupleType} from '../operands/types';

export class ArrayOperator extends MultipleTokenOperator {
    cloneWith(appliedItems: OperatorListType[]): MultipleTokenOperator {
        return new ArrayOperator(this.tokens, appliedItems);
    }

    getType(): OperationType {
        let main: OperationType = {
            input: [],
            output: [],
            types: {}
        };

        let arrayArity: null | TypeArity = this.items.length > 0 ?
            arityFromSubToMain(main, runTypeCheck(this.items[0])) :
            null;

        pushOutputMemberTypes(main, {
            type: 'array',
            array: arrayArity
        });

        return main;
    }
}

export class TupleOperator extends MultipleTokenOperator {
    cloneWith(appliedItems: OperatorListType[]): MultipleTokenOperator {
        return new TupleOperator(this.tokens, appliedItems);
    }

    getType(): OperationType {
        let main: OperationType = {
            input: [],
            output: [],
            types: {}
        };

        let tupleArity: TypeArity[] = this.items.map(item => arityFromSubToMain(main, runTypeCheck(item)));
        pushOutputMemberTypes(main, {
            type: 'tuple',
            tuple: tupleArity
        });

        return main;
    }
}

