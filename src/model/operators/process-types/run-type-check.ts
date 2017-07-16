import {OperationType} from "../../operands/operand-types";
import {OperatorList} from "../operator";

export function runTypeCheck(operators: OperatorList, namespace: { [name: string]: OperationType }): OperationType {
    const result: OperationType = {
        input: [],
        output: [],
        types: {},
    };

    operators.forEach(operator => operator.applyTypes(result, namespace));

    return result;
}
