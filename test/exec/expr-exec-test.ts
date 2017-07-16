import {expect} from "chai";
import {ExecNamespace} from "../../src/model/exec/namespace";
import {Stack} from "../../src/model/exec/stack";
import {Expression} from "../../src/model/expression";
import {RefOperator} from "../../src/model/operators/ref";
import {execTest, popTwo} from "./utils";

describe("expression ref operator types", () => {
    let namespace: ExecNamespace;

    beforeEach(() => {
        namespace = {
            add: {
                applyTo: (stack: Stack) => {
                    const [a, b] = popTwo(stack);
                    stack.push({val: a + b});
                },
            },
            arr_get: {
                applyTo: (stack: Stack) => {
                    const [a, b] = popTwo(stack);
                    stack.push({val: a[b]});
                },
            },
            concat: {
                applyTo: (stack: Stack) => {
                    const [a, b] = popTwo(stack);
                    stack.push({val: a + b});
                },
            },
            n: {
                applyTo: (stack: Stack) => {
                    stack.push({val: 3.14});
                },
            },
            s: {
                applyTo: (stack: Stack) => {
                    stack.push({val: "hi world"});
                },
            },
            subtract: {
                applyTo: (stack: Stack) => {
                    const [a, b] = popTwo(stack);
                    stack.push({val: a - b});
                },
            },
            switch2: {
                applyTo: (stack: Stack) => {
                    const [a, b] = popTwo(stack);
                    stack.push({val: b});
                    stack.push({val: a});
                },
            },
        };
    });

    describe("literal types", () => {
        it("should apply literal expr", () => {
            execTest("s", namespace, [
                "hi world",
            ]);
        });

        it("should apply multiple expr", () => {
            execTest("s n", namespace, [
                "hi world",
                3.14,
            ]);
        });

        it("should use expressions in arrays", () => {
            execTest("[s]", namespace, [
                ["hi world"],
            ]);
        });

        it("should use expressions in wraps", () => {
            const e = new Expression("{s n}");
            const result = e.exec(namespace);
            const [wrapped] = result;
            const [o1, o2] = wrapped.val as any[];
            expect(o1.constructor).to.equal(RefOperator);
            expect(o1.ref).to.equal("s");
            expect(o2.constructor).to.equal(RefOperator);
            expect(o2.ref).to.equal("n");
        });

        it("should use expressions in tuples", () => {
            execTest("(n, s, n)", namespace, [
                [3.14, "hi world", 3.14],
            ]);
        });
    });

    describe("function types", () => {
        it("should apply function expr", () => {
            execTest("1 2 add", namespace, [
                3,
            ]);
        });
        it("should combine function expr", () => {
            execTest("1 2 3 add add", namespace, [
                6,
            ]);
        });

        it("should get params in right order", () => {
            execTest("1 2 subtract", namespace, [
                -1,
            ]);
        });

        it("should combine ops correctly", () => {
            execTest("1 2 switch2 subtract", namespace, [
                1,
            ]);
        });
    });
});
