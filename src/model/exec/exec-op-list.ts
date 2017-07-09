import {OperatorList} from "../operators/operator";
import {ExecNamespace} from "./namespace";
import {Stack} from "./stack";

export default function execOpList(ops: OperatorList, namespace: ExecNamespace): Stack {
    let stack: Stack = [];
    ops.forEach(operator => {
        return operator.exec(stack, namespace);
    });
    return stack;
}
