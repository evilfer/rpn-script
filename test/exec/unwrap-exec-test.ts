import {Runnable} from "../../src/model/exec/runnable";
import {Stack, StackValue} from "../../src/model/exec/stack";
import {execTest, popTwo} from "./utils";

describe("unwrap operator types", () => {
    let namespace: { [name: string]: Runnable };

    beforeEach(() => {
        namespace = {
            add: {
                applyTo: (stack: Stack): void => {
                    const [a, b] = popTwo(stack);
                    stack.push({val: a + b});
                },
            },
            arr_get: {
                applyTo: (stack: Stack) => {
                    const [a, b] = popTwo(stack);
                    stack.push({val: a[b].val});
                },
            },
            concat: {
                applyTo: (stack: Stack) => {
                    const [a, b] = popTwo(stack);
                    stack.push({val: a + b});
                },
            },
            duplicate: {
                applyTo: (stack: Stack) => {
                    const v: any = (stack.pop() as StackValue).val;
                    stack.push({val: v});
                    stack.push({val: v});
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

    it("should provide unwrap types with wrapped operand", () => {
        execTest("1 2 {add} }2:1{", namespace, [3]);
    });

    it("should provide unwrap types with wrapped operand involving undefined types", () => {
        execTest("[\"hi\"] 0 {arr_get} }2:1{", namespace, ["hi"]);
    });

    it("should provide unwrap types with wrapped operand involving undefined types + operations on them", () => {
        execTest("[\"hi\"] 0 {arr_get} }2:1{ duplicate", namespace, ["hi", "hi"]);
    });

    it("should provide unwrap types with wrapped operand involving undefined types and their refinement", () => {
        execTest("[1] 0 {arr_get} }2:1{ 1 add", namespace, [2]);
    });

    it("should exec duplicate as wrapped", () => {
        execTest("1 {duplicate} }1:2{", namespace, [1, 1]);
    });

    it("should unwrap wrapped unwraps", () => {
        execTest("{s} {}0:1{} }{", namespace, ["hi world"]);
    });

});
