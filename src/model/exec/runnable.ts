import {Stack} from "./stack";
import {ExecNamespace} from "./namespace";
export interface Runnable {
    applyTo(stack: Stack, namespace: ExecNamespace): void;
}
