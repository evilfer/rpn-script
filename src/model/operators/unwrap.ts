import {SingleTokenOperator} from './operator';
import {OperationType} from "../operands/operand-types";
import {CodeToken} from "../code-token";
import {popInputType, popTypeAndMatch, pushType} from "./process-types/basic-ops";
import {matchExpectedWrapped} from "./process-types/match-unwrap";
import {Stack} from "../exec/stack";
import {ExecNamespace} from "../exec/namespace";


export class UnwrapOperator extends SingleTokenOperator {
    isDefined: boolean;
    arity: null | { input: number, output: number };

    constructor(token: CodeToken) {
        super(token);

        let match = token.code.match(/}(?:([0-9]+):)?([0-9]+){/);
        if (match) {
            this.isDefined = true;
            this.arity = {
                input: match[1] ? parseInt(match[1]) : 0,
                output: parseInt(match[2])
            };
        } else {
            this.isDefined = false;
            this.arity = null;
        }
    }

    applyTypes(current: OperationType, namespace: { [p: string]: OperationType }): void {
        let typeId = popInputType(current);
        matchExpectedWrapped(current, typeId, this.arity);
        let type = current.types[typeId];

        if (type.wrapped) {
            [...type.wrapped.input].reverse().forEach(id => popTypeAndMatch(current, id));
            type.wrapped.output.forEach(id => pushType(current, id));
        }
    }

    exec(stack: Stack, namespace: ExecNamespace): void {
        throw new Error("not implemented");
    }
}
