import execOpList from "../exec/exec-op-list";
import {ExecNamespace} from "../exec/namespace";
import {Stack} from "../exec/stack";
import {OperationType, TypeArity} from "../operands/operand-types";
import {MultipleTokenOperator} from "./multiple-token-operator";
import {OperatorList} from "./operator";
import {arityFromSubToMain} from "./process-types/add-sub-main";
import {addAnyType, pushOutputMemberTypes} from "./process-types/basic-ops";
import {runTypeCheck} from "./process-types/run-type-check";

export class ArrayOperator extends MultipleTokenOperator {
    public cloneWith(appliedItems: OperatorList[]): MultipleTokenOperator {
        return new ArrayOperator(this.tokens, appliedItems);
    }

    public applyTypes(current: OperationType, namespace: { [name: string]: OperationType }): void {
        let arrayType: number;

        if (this.items.length > 0) {
            const arrayArity: TypeArity = arityFromSubToMain(current, runTypeCheck(this.items[0], namespace));
            arrayType = arrayArity.output[0];
        } else {
            arrayType = addAnyType(current);
        }

        pushOutputMemberTypes(current, {
            type: "array",
            array: arrayType,
        });
    }

    public exec(stack: Stack, namespace: ExecNamespace): void {
        stack.push({val: this.items.map((item) => execOpList(item, namespace)[0])});
    }
}
