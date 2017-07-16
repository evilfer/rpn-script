import {
    analyzeDependencies,
    analyzeEq,
    analyzeMatchingTokens,
    analyzeName,
    analyzeNamedArgs,
    analyzeRhs,
    splitTokens,
} from "../parser/analyze-tokens";
import parseTokens from "../parser/parse-tokens";
import {CodeToken} from "./code-token";
import execOpList from "./exec/exec-op-list";
import {ExecNamespace} from "./exec/namespace";
import {Runnable} from "./exec/runnable";
import {Stack, StackValue} from "./exec/stack";
import {OperationType} from "./operands/operand-types";
import {createOperators} from "./operators/create-operator";
import {OperatorList} from "./operators/operator";
import {cleanTypes} from "./operators/process-types/clean";

export class Expression implements Runnable {
    public errors: boolean;
    public name: null | string;
    public code: string;
    public tokens: CodeToken[];
    public hash: string;
    public namedArgs: string[];
    public opsUseArgs: boolean;
    public operators: OperatorList;
    public dependencies: string[];

    constructor(code: string) {
        this.errors = false;
        this.code = code;

        const tokens: CodeToken[] = parseTokens(code);
        this.tokens = tokens;
        this.hash = tokens.map(token => token.code).join(" ");

        const {lhs, rhs, eq} = splitTokens(tokens);
        analyzeEq(lhs, eq);

        this.name = analyzeName(lhs);
        this.namedArgs = analyzeNamedArgs(lhs, this.name).reverse();

        analyzeRhs(rhs, this.namedArgs);
        analyzeMatchingTokens(rhs);

        this.dependencies = analyzeDependencies(rhs, this.name, this.namedArgs);

        this.errors = tokens.some(token => token.errors.length > 0);

        if (!this.errors) {
            this.operators = createOperators(rhs);
            this.opsUseArgs = this.operators.some(op => op.requiresArgs());
            this.errors = tokens.some(token => token.errors.length > 0);
        }
    }

    public appliedTypeOperators(args: { [key: string]: number } = {}): OperatorList {
        return this.opsUseArgs ? this.operators.map(op => op.appliedTypeWithArgs(args)) : this.operators;
    }

    public getType(namespace: { [name: string]: OperationType }): OperationType {
        const main: OperationType = {
            input: [],
            output: [],
            types: {},
        };

        const argMap: { [name: string]: number } = {};

        this.namedArgs.forEach((name, i) => {
            main.input.push(i);
            argMap[name] = i;
            main.types[i] = {type: null};
        });

        const appliedOps = this.appliedTypeOperators(argMap);
        appliedOps.forEach(operator => operator.applyTypes(main, namespace));

        cleanTypes(main);
        return main;
    }

    public exec(namespace: ExecNamespace): Stack {
        return execOpList(this.operators, namespace);
    }

    public applyTo(stack: Stack, namespace: ExecNamespace): void {
        const argMap: { [name: string]: StackValue } = {};

        this.namedArgs.forEach(name => {
            const arg = stack.pop();
            if (typeof arg === "undefined") {
                throw new Error("missing arg");
            }
            argMap[name] = arg;
        });

        const appliedOps = this.appliedExecOperators(argMap);
        appliedOps.forEach(operator => operator.exec(stack, namespace));
    }

    public appliedExecOperators(args: { [key: string]: StackValue } = {}): OperatorList {
        return this.opsUseArgs ? this.operators.map(op => op.appliedExecWithArgs(args)) : this.operators;
    }
}
