import {Runnable} from "./runnable";

export interface ExecNamespace {
    [name: string]: Runnable;
}
