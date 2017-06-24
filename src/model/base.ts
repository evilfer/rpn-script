import {RpnError} from './errors';

export type OperatorListType = Operator[];

export abstract class Operator {
    errors: RpnError[];

    constructor() {
        this.errors = [];
    }

    applied<T>(args: { [key: string]: T }): Operator {
        return this;
    }

    requiresArgs(): boolean {
        return false;
    }



    /*runTypeCheck(context: TypeCheckContext) {
        throw new Error('runTypeCheck not implemented');
    }*/
}
