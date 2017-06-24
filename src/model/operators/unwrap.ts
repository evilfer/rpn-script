import {SingleTokenOperator} from './operator';
import {OperationType} from "../operands/operand-types";


export class UnwrapOperator extends SingleTokenOperator {
    getType(current: OperationType): OperationType {
        return {
            input: [],
            output: [],
            types: {}
        };
    }
}
