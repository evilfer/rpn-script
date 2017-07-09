import {MultipleTokenOperator, OperatorList} from './operator';
import {OperationType, TypeArity} from "../operands/operand-types";
import {arityFromSubToMain} from "./process-types/add-sub-main";
import {runTypeCheck} from "./process-types/run-type-check";
import {addAnyType, pushOutputMemberTypes} from "./process-types/basic-ops";
import {Stack} from "../exec/stack";
import {ExecNamespace} from "../exec/namespace";
import execOpList from "../exec/exec-op-list";

export class ArrayOperator extends MultipleTokenOperator {
    cloneWith(appliedItems: OperatorList[]): MultipleTokenOperator {
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

    exec(stack: Stack, namespace: ExecNamespace): void {
        stack.push({val: this.items.map(item => execOpList(item, namespace)[0])});
    }
}

export class TupleOperator extends MultipleTokenOperator {
    cloneWith(appliedItems: OperatorList[]): MultipleTokenOperator {
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

    exec(stack: Stack, namespace: ExecNamespace): void {
        stack.push({val: this.items.map(item => execOpList(item, namespace)[0])});
    }
}

