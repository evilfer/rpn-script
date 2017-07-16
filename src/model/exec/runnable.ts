import {ExecNamespace} from "./namespace";
import {Stack} from "./stack";

export interface Runnable {
    applyTo(stack: Stack, namespace: ExecNamespace): void;
}
