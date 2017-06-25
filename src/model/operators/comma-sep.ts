import {MultipleTokenOperator} from './operator';
import {OperatorListType} from '../base';
import {OperationType, TypeArity} from "../operands/operand-types";
import {arityFromSubToMain, pushOutputMemberTypes, runTypeCheck} from "./run-type-check";

export class ArrayOperator extends MultipleTokenOperator {
    cloneWith(appliedItems: OperatorListType[]): MultipleTokenOperator {
        return new ArrayOperator(this.tokens, appliedItems);
    }

    applyTypes(current: OperationType, namespace: { [name: string]: OperationType }): void {
        let arrayArity: null | TypeArity = this.items.length > 0 ?
            arityFromSubToMain(current, runTypeCheck(this.items[0], namespace)) :
            null;

        pushOutputMemberTypes(current, {
            type: 'array',
            array: arrayArity
        });
    }
}

export class TupleOperator extends MultipleTokenOperator {
    cloneWith(appliedItems: OperatorListType[]): MultipleTokenOperator {
        return new TupleOperator(this.tokens, appliedItems);
    }

    applyTypes(current: OperationType, namespace: { [name: string]: OperationType }): void {
        let tupleArity: TypeArity[] = this.items.map(item => arityFromSubToMain(current, runTypeCheck(item, namespace)));

        pushOutputMemberTypes(current, {
            type: 'tuple',
            tuple: tupleArity
        });
    }
}

