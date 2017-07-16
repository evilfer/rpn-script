import {OperatorList} from "../operators/operator";
import {ExecNamespace} from "./namespace";
import {Stack} from "./stack";

export default function execOpListOn(ops: OperatorList, namespace: ExecNamespace, stack: Stack) {
    ops.forEach(operator => {
        return operator.exec(stack, namespace);
    });
}
