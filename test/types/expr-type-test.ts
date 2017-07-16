import {expect} from "chai";
import {Expression} from "../../src/model/expression";
import debugOpType2string from "../../src/model/operands/debug-operation-type-to-string";
import {OperationType} from "../../src/model/operands/operand-types";

describe("expression ref operator types", () => {
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
                        type: "array",
                        array: 1,
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

    describe("literal types", () => {
        it("should apply literal expr", () => {
            const e = new Expression("s");
            const type = e.getType(namespace);
            expect(type).to.deep.eq({
                input: [],
                output: [0],
                types: {
                    0: {type: "string"},
                },
            });
            expect(debugOpType2string(type)).to.equal("string");
        });

        it("should apply multiple expr", () => {
            const e = new Expression("s n");
            const type = e.getType(namespace);
            expect(type).to.deep.eq({
                input: [],
                output: [0, 1],
                types: {
                    0: {type: "string"},
                    1: {type: "number"},
                },
            });
            expect(debugOpType2string(type)).to.equal("string number");
        });

        it("should use expressions in arrays", () => {
            const e = new Expression("[s]");
            const type = e.getType(namespace);
            expect(type).to.deep.eq({
                input: [],
                output: [1],
                types: {
                    0: {type: "string"},
                    1: {
                        array: 0,
                        type: "array",
                    },
                },
            });
            expect(debugOpType2string(type)).to.equal("[string]");
        });

        it("should use expressions in wraps", () => {
            const e = new Expression("{s n}");
            const type = e.getType(namespace);
            expect(type).to.deep.eq({
                input: [],
                output: [2],
                types: {
                    0: {type: "string"},
                    1: {type: "number"},
                    2: {
                        type: "wrapped",
                        wrapped: {input: [], output: [0, 1]},
                    },
                },
            });
            expect(debugOpType2string(type)).to.equal("{string number}");
        });

        it("should use expressions in tuples", () => {
            const e = new Expression("(n, s, n)");
            const type = e.getType(namespace);
            expect(type).to.deep.eq({
                input: [],
                output: [3],
                types: {
                    0: {type: "number"},
                    1: {type: "string"},
                    2: {type: "number"},
                    3: {
                        tuple: [0, 1, 2],
                        type: "tuple",
                    },
                },
            });
            expect(debugOpType2string(type)).to.equal("(number, string, number)");
        });
    });

    describe("function types", () => {
        it("should apply function expr", () => {
            const e = new Expression("add");
            const type = e.getType(namespace);
            expect(type).to.deep.eq({
                input: [0, 1],
                output: [2],
                types: {
                    0: {type: "number"},
                    1: {type: "number"},
                    2: {type: "number"},
                },
            });
            expect(debugOpType2string(type)).to.equal("number number -> number");
        });

        it("should combine function expr", () => {
            const e = new Expression("add add");
            const type = e.getType(namespace);
            /* 2 == 4. both consumed */
            expect(type).to.deep.eq({
                input: [3, 0, 1],
                output: [5],
                types: {
                    0: {type: "number"},
                    1: {type: "number"},
                    3: {type: "number"},
                    5: {type: "number"},
                },
            });
            expect(debugOpType2string(type)).to.equal("number number number -> number");
        });

        it("should infer types of used operands (all)", () => {
            const e = new Expression("switch2 add");
            const type = e.getType(namespace);

            expect(type).to.deep.eq({
                input: [0, 1],
                output: [4],
                types: {
                    0: {type: "number"},
                    1: {type: "number"},
                    4: {type: "number"},
                },
            });
            expect(debugOpType2string(type)).to.equal("number number -> number");
        });

        it("should infer types of used operands (partial)", () => {
            const e = new Expression("switch2 1 add");
            const type = e.getType(namespace);

            expect(debugOpType2string(type)).to.equal("number A:? -> A:? number");
        });

        it("should infer type of expected array", () => {
            const e = new Expression('0 arr_get " world" concat');
            const type = e.getType(namespace);

            expect(type).to.deep.eq({
                input: [1],
                output: [7],
                types: {
                    1: {
                        array: 2,
                        type: "array",
                    },
                    2: {type: "string"},
                    7: {type: "string"},
                },
            });
            expect(debugOpType2string(type)).to.equal("[string] -> string");
        });
    });
});
