import {CodeToken} from "../code-token";
import {ExecNamespace} from "../exec/namespace";
import {Runnable} from "../exec/runnable";
import {Stack} from "../exec/stack";
import {OperationType, TypeArity} from "../operands/operand-types";
import {arityFromSubToMain} from "./process-types/add-sub-main";
import {matchTypes} from "./process-types/match";
import {SingleTokenOperator} from "./single-token-operator";

export class RefOperator extends SingleTokenOperator {
    public ref: string;

    constructor(token: CodeToken) {
        super(token);
        this.ref = token.code;
    }

    public applyTypes(current: OperationType, namespace: { [p: string]: OperationType }): void {
        if (!namespace[this.ref]) {
            throw new Error(`${this.ref} does not exist`);
        }

        const type: OperationType = namespace[this.ref];
        const arity: TypeArity = arityFromSubToMain(current, type);

        const matches: Array<[number, number]> = [];

        [...arity.input].reverse().forEach(tid => {
            if (current.output.length > 0) {
                const matched = current.output.pop() as number;
                if (matched !== tid) {
                    matches.push([matched, tid]);
                }
            } else {
                current.input.unshift(tid);
            }
        });

        arity.output.forEach(tid => current.output.push(tid));

        const tx: { [id: number]: number } = {};

        matches.forEach(([a, b]) => matchTypes(current, tx, a, b));
    }

    public exec(stack: Stack, namespace: ExecNamespace): void {
        const runnable: Runnable = namespace[this.ref];
        if (!runnable) {
            throw new Error("bad ref");
        }

        runnable.applyTo(stack, namespace);
    }
}
