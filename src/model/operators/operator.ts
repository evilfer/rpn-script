import {CodeToken} from '../code-token';
import {Operator} from '../base';
import {OperatorListType} from '../base';
import {OperandType} from "../operands/operand-types";

export abstract class SingleTokenOperator extends Operator {
    token: CodeToken;

    constructor(token: CodeToken) {
        super();
        this.token = token;
    }
}


export abstract class MultipleTokenOperator extends Operator {
    tokens: CodeToken[];
    items: OperatorListType[];
    childrenRequireArgs: boolean[];
    argsRequired: boolean;

    constructor(tokens: CodeToken[], items: OperatorListType[]) {
        super();
        this.tokens = tokens;
        this.items = items;

        this.childrenRequireArgs = items.map(list => list.some(token => token.requiresArgs()));
        this.argsRequired = this.childrenRequireArgs.some(v => v);
    }

    abstract cloneWith(appliedItems: OperatorListType[]): MultipleTokenOperator;

    appliedType(args: { [key: string]: OperandType }): Operator {
        if (!this.argsRequired) {
            return this;
        }

        let appliedItems: OperatorListType[] = this.items.map((item, i) => this.childrenRequireArgs[i] ?
            item.map(op => op.appliedType(args)) :
            item
        );

        return this.cloneWith(appliedItems);
    }

    requiresArgs(): boolean {
        return this.argsRequired;
    }
}
