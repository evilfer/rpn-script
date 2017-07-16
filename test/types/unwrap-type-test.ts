import {expect} from "chai";
import {Expression} from "../../src/model/expression";
import debugOpType2string from "../../src/model/operands/debug-operation-type-to-string";
import {OperationType} from "../../src/model/operands/operand-types";

describe("unwrap operator types", () => {
    let namespace: { [name: string]: OperationType };

    beforeEach(() => {
        namespace = {
            add: {
                input: [0, 1],
                output: [2],
                types: {
                    0: {type: "number"},
                    1: {type: "number"},
                    2: {type: "number"},
                },
            },
            arr_get: {
                input: [0, 2],
                output: [1],
                types: {
                    0: {
                        array: 1,
                        type: "array",
                    },
                    1: {type: null},
                    2: {type: "number"},
                },
            },
            concat: {
                input: [0, 1],
                output: [2],
                types: {
                    0: {type: "string"},
                    1: {type: "string"},
                    2: {type: "string"},
                },
            },
            duplicate: {
                input: [0],
                output: [0, 0],
                types: {
                    0: {type: null},
                },
            },
            n: {
                input: [],
                output: [0],
                types: {
                    0: {type: "number"},
                },
            },
            s: {
                input: [],
                output: [0],
                types: {
                    0: {type: "string"},
                },
            },
            switch2: {
                input: [0, 1],
                output: [1, 0],
                types: {
                    0: {type: null},
                    1: {type: null},
                },
            },
        };
    });

    it("should provide unwrap types without wrapped operand", () => {
        const e = new Expression("}1:2{");
        const type = e.getType({});

        expect(debugOpType2string(type)).to.equal("A:? -> B:? C:?");
    });

    it("should provide unwrap types with wrapped operand", () => {
        const e = new Expression("{add} }2:1{");
        const type = e.getType(namespace);

        expect(debugOpType2string(type)).to.equal("number number -> number");
    });

    it("should provide unwrap types with wrapped operand involving undefined types", () => {
        const e = new Expression("{arr_get} }2:1{");
        const type = e.getType(namespace);

        expect(debugOpType2string(type)).to.equal("A:[B:?] number -> B:?");
    });

    it("should provide unwrap types with wrapped operand involving undefined types + operations on them", () => {
        const e = new Expression("{arr_get} }2:1{ duplicate");
        const type = e.getType(namespace);

        expect(debugOpType2string(type)).to.equal("A:[B:?] number -> B:? B:?");
    });

    it("should provide unwrap types with wrapped operand involving undefined types and their refinement", () => {
        const e = new Expression("0 {arr_get} }2:1{ 1 add");
        const type = e.getType(namespace);

        expect(debugOpType2string(type)).to.equal("[number] -> number");
    });

    it("should provide unwrap types with wrapped operand involving undefined types + operations + refinement", () => {
        const e = new Expression("{arr_get} }2:1{ duplicate concat");
        const type = e.getType(namespace);

        expect(debugOpType2string(type)).to.equal("[string] number -> string");
    });

    it("should unwrap wrapped unwraps", () => {
        const e = new Expression("{}1:1{} }{");
        const type = e.getType(namespace);

        expect(debugOpType2string(type)).to.equal("A:? -> B:?");
    });

});
