import {OperatorList} from "../operators/operator";
import execOpListOn from "./exec-on";
import {ExecNamespace} from "./namespace";
import {Stack} from "./stack";

export default function execOpList(ops: OperatorList, namespace: ExecNamespace): Stack {
    const stack: Stack = [];
    execOpListOn(ops, namespace, stack);
    return stack;
}
