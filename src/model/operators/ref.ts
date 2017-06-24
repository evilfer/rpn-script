import {SingleTokenOperator} from './operator';
import {CodeToken} from '../code-token';
import {OperationType} from "../operands/operand-types";


export class RefOperator extends SingleTokenOperator {
    ref: string;

    constructor(token: CodeToken) {
        super(token);
        this.ref = token.code;
    }

    getType(current: OperationType, namespace: { [name: string]: OperationType }): OperationType {
        if (!namespace[this.ref]) {
            throw new Error(`${this.ref} does not exist`);
        }

        return namespace[this.ref];
    }
}
