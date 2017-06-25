import {SingleTokenOperator} from './operator';
import {OperationType} from "../operands/operand-types";


export class UnwrapOperator extends SingleTokenOperator {
    applyTypes(current: OperationType, namespace: { [p: string]: OperationType }): void {
    }
}
