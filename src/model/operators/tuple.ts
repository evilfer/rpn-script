import execOpList from "../exec/exec-op-list";
import {ExecNamespace} from "../exec/namespace";
import {Stack} from "../exec/stack";
import {OperationType} from "../operands/operand-types";
import {MultipleTokenOperator} from "./multiple-token-operator";
import {OperatorList} from "./operator";
import {arityFromSubToMain} from "./process-types/add-sub-main";
import {pushOutputMemberTypes} from "./process-types/basic-ops";
import {runTypeCheck} from "./process-types/run-type-check";

export class TupleOperator extends MultipleTokenOperator {
    public cloneWith(appliedItems: OperatorList[]): MultipleTokenOperator {
        return new TupleOperator(this.tokens, appliedItems);
    }

    public applyTypes(current: OperationType, namespace: { [name: string]: OperationType }): void {
        const tupleTypes: number[] = this.items.map(item => {
            return arityFromSubToMain(current, runTypeCheck(item, namespace)).output[0];
        });

        pushOutputMemberTypes(current, {
            tuple: tupleTypes,
            type: "tuple",
        });
    }

    public exec(stack: Stack, namespace: ExecNamespace): void {
        stack.push({val: this.items.map(item => execOpList(item, namespace)[0])});
    }
}
