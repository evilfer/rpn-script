import {CodeToken} from '../code-token';
import {OperationType} from "../operands/operand-types";
import {RpnError} from "../errors";
import {Stack} from "../exec/stack";
import {ExecNamespace} from "../exec/namespace";

export type OperatorList = Operator[];

export abstract class Operator {
    errors: RpnError[];

    constructor() {
        this.errors = [];
    }

    appliedTypeWithArgs(args: { [key: string]: number }): Operator {
        return this;
    }


    requiresArgs(): boolean {
        return false;
    }

    abstract applyTypes(current: OperationType, namespace: { [name: string]: OperationType }): void;

    abstract exec(stack: Stack, namespace: ExecNamespace): void;
}

export abstract class SingleTokenOperator extends Operator {
    token: CodeToken;

    constructor(token: CodeToken) {
        super();
        this.token = token;
    }
}


export abstract class MultipleTokenOperator extends Operator {
    tokens: CodeToken[];
    items: OperatorList[];
    childrenRequireArgs: boolean[];
    argsRequired: boolean;

    constructor(tokens: CodeToken[], items: OperatorList[]) {
        super();
        this.tokens = tokens;
        this.items = items;

        this.childrenRequireArgs = items.map(list => list.some(token => token.requiresArgs()));
        this.argsRequired = this.childrenRequireArgs.some(v => v);
    }

    abstract cloneWith(appliedItems: OperatorList[]): MultipleTokenOperator;

    appliedTypeWithArgs(args: { [key: string]: number }): Operator {
        if (!this.argsRequired) {
            return this;
        }

        let appliedItems: OperatorList[] = this.items.map((item, i) => this.childrenRequireArgs[i] ?
            item.map(op => op.appliedTypeWithArgs(args)) :
            item
        );

        return this.cloneWith(appliedItems);
    }

    requiresArgs(): boolean {
        return this.argsRequired;
    }
}
