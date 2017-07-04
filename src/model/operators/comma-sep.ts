import {MultipleTokenOperator} from './operator';
import {OperatorListType} from '../base';
import {OperationType, TypeArity} from "../operands/operand-types";
import {addAnyType, arityFromSubToMain, pushOutputMemberTypes, runTypeCheck} from "./run-type-check";

export class ArrayOperator extends MultipleTokenOperator {
    cloneWith(appliedItems: OperatorListType[]): MultipleTokenOperator {
        return new ArrayOperator(this.tokens, appliedItems);
    }

    applyTypes(current: OperationType, namespace: { [name: string]: OperationType }): void {
        let arrayType: number;

        if (this.items.length > 0) {

            let arrayArity: TypeArity = arityFromSubToMain(current, runTypeCheck(this.items[0], namespace));
            arrayType = arrayArity.output[0];
        } else {
            arrayType = addAnyType(current);
        }

        pushOutputMemberTypes(current, {
            type: 'array',
            array: arrayType
        });
    }
}

export class TupleOperator extends MultipleTokenOperator {
    cloneWith(appliedItems: OperatorListType[]): MultipleTokenOperator {
        return new TupleOperator(this.tokens, appliedItems);
    }

    applyTypes(current: OperationType, namespace: { [name: string]: OperationType }): void {
        let tupleTypes: number[] = this.items.map(item => {
            return arityFromSubToMain(current, runTypeCheck(item, namespace)).output[0];
        });

        pushOutputMemberTypes(current, {
            type: 'tuple',
            tuple: tupleTypes
        });
    }
}

