import {SingleTokenOperator} from './operator';
import {CodeToken} from '../code-token';
import {OperationType, TypeArity} from "../operands/operand-types";
import {arityFromSubToMain, matchTypes} from "./run-type-check";


export class RefOperator extends SingleTokenOperator {
    ref: string;

    constructor(token: CodeToken) {
        super(token);
        this.ref = token.code;
    }

    applyTypes(current: OperationType, namespace: { [p: string]: OperationType }): void {
        if (!namespace[this.ref]) {
            throw new Error(`${this.ref} does not exist`);
        }

        let type: OperationType = namespace[this.ref];
        let arity: TypeArity = arityFromSubToMain(current, type);

        let matches: [number, number][] = [];

        [...arity.input].reverse().forEach(tid => {
            if (current.output.length > 0) {
                let matched = <number> current.output.pop();
                if (matched !== tid) {
                    matches.push([matched, tid]);
                }
            } else {
                current.input.unshift(tid);
            }
        });

        arity.output.forEach(tid => current.output.push(tid));

        matches.forEach(([a, b]) => matchTypes(current, a, b));
    }
}
