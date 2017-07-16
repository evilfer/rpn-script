import {CodeToken} from "../code-token";
import {StackValue} from "../exec/stack";
import {Operator, OperatorList} from "./operator";

export abstract class MultipleTokenOperator extends Operator {
    public tokens: CodeToken[];
    public items: OperatorList[];
    public childrenRequireArgs: boolean[];
    public argsRequired: boolean;

    constructor(tokens: CodeToken[], items: OperatorList[]) {
        super();
        this.tokens = tokens;
        this.items = items;

        this.childrenRequireArgs = items.map(list => list.some(token => token.requiresArgs()));
        this.argsRequired = this.childrenRequireArgs.some(v => v);
    }

    public abstract cloneWith(appliedItems: OperatorList[]): MultipleTokenOperator;

    public appliedTypeWithArgs(args: { [key: string]: number }): Operator {
        if (!this.argsRequired) {
            return this;
        }

        const appliedItems: OperatorList[] = this.items.map((item, i) => this.childrenRequireArgs[i] ?
            item.map((op) => op.appliedTypeWithArgs(args)) :
            item,
        );

        return this.cloneWith(appliedItems);
    }

    public appliedExecWithArgs(args: { [key: string]: StackValue }): MultipleTokenOperator {
        if (!this.argsRequired) {
            return this;
        }

        const appliedItems: OperatorList[] = this.items.map((item, i) => this.childrenRequireArgs[i] ?
            item.map(op => op.appliedExecWithArgs(args)) :
            item,
        );

        return this.cloneWith(appliedItems);
    }

    public requiresArgs(): boolean {
        return this.argsRequired;
    }
}
