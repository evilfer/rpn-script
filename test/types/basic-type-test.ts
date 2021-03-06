import {expect} from "chai";
import {Expression} from "../../src/model/expression";
import debugOpType2string from "../../src/model/operands/debug-operation-type-to-string";

describe("basic operator types", () => {
    describe("literal types", () => {

        it("should provide number literal type", () => {
            const e = new Expression("1 2.5");
            const type = e.getType({});

            expect(type).to.deep.eq({
                input: [],
                output: [0, 1],
                types: {
                    0: {
                        type: "number",
                    },
                    1: {
                        type: "number",
                    },
                },
            });

            expect(debugOpType2string(type)).to.equal("number number");
        });

        it("should provide string literal type", () => {
            const e = new Expression('"a" "3"');
            const type = e.getType({});
            expect(type).to.deep.eq({
                input: [],
                output: [0, 1],
                types: {
                    0: {
                        type: "string",
                    },
                    1: {
                        type: "string",
                    },
                },
            });

            expect(debugOpType2string(type)).to.equal("string string");
        });

        it("should provide boolean literal type", () => {
            const e = new Expression("true false");
            const type = e.getType({});
            expect(type).to.deep.eq({
                input: [],
                output: [0, 1],
                types: {
                    0: {
                        type: "boolean",
                    },
                    1: {
                        type: "boolean",
                    },
                },
            });

            expect(debugOpType2string(type)).to.equal("boolean boolean");
        });
    });

    describe("arrays", () => {
        it("should provide untyped array", () => {
            const e = new Expression("[]");
            const type = e.getType({});

            expect(type).to.deep.eq({
                input: [],
                output: [1],
                types: {
                    0: {
                        type: null,
                    },
                    1: {
                        array: 0,
                        type: "array",
                    },
                },
            });
            expect(debugOpType2string(type)).to.equal("A:[B:?]");
        });

        it("should provide literal type array", () => {
            const e = new Expression("[1]");
            const type = e.getType({});

            expect(type).to.deep.eq({
                input: [],
                output: [1],
                types: {
                    0: {
                        type: "number",
                    },
                    1: {
                        array: 0,
                        type: "array",
                    },
                },
            });
            expect(debugOpType2string(type)).to.equal("[number]");
        });

        it("should provide multiple literal type array", () => {
            const e = new Expression('["1", "2"]');
            const type = e.getType({});

            expect(type).to.deep.eq({
                input: [],
                output: [1],
                types: {
                    0: {
                        type: "string",
                    },
                    1: {
                        array: 0,
                        type: "array",
                    },
                },
            });
            expect(debugOpType2string(type)).to.equal("[string]");
        });

        it("should handle nested arrays", () => {
            const e = new Expression("[[]]");
            const type = e.getType({});

            expect(type).to.deep.eq({
                input: [],
                output: [2],
                types: {
                    0: {
                        array: 1,
                        type: "array",
                    },
                    1: {
                        type: null,
                    },
                    2: {
                        array: 0,
                        type: "array",
                    },
                },
            });
            expect(debugOpType2string(type)).to.equal("A:[B:[C:?]]");
        });
    });

    describe("tuples", () => {
        it("should provide empty tuple", () => {
            const e = new Expression("()");
            const type = e.getType({});

            expect(type).to.deep.eq({
                input: [],
                output: [0],
                types: {
                    0: {
                        tuple: [],
                        type: "tuple",
                    },
                },
            });
            expect(debugOpType2string(type)).to.equal("()");
        });

        it("should provide literal tuple", () => {
            const e = new Expression('(1, "1")');
            const type = e.getType({});

            expect(type).to.deep.eq({
                input: [],
                output: [2],
                types: {
                    0: {
                        type: "number",
                    },
                    1: {
                        type: "string",
                    },
                    2: {
                        tuple: [0, 1],
                        type: "tuple",
                    },
                },
            });
            expect(debugOpType2string(type)).to.equal("(number, string)");

        });
    });

    describe("wrapped", () => {
        it("should provide empty wrapped operators", () => {
            const e = new Expression("{}");
            const type = e.getType({});

            expect(type).to.deep.eq({
                input: [],
                output: [0],
                types: {
                    0: {
                        type: "wrapped",
                        wrapped: {
                            input: [],
                            output: [],
                        },
                    },
                },
            });
            expect(debugOpType2string(type)).to.equal("{}");
        });

        it("should provide literal wrapped operators", () => {
            const e = new Expression("{1}");
            const type = e.getType({});

            expect(type).to.deep.eq({
                input: [],
                output: [1],
                types: {
                    0: {
                        type: "number",
                    },
                    1: {
                        type: "wrapped",
                        wrapped: {
                            input: [],
                            output: [0],
                        },
                    },
                },
            });
            expect(debugOpType2string(type)).to.equal("{number}");
        });
    });

});
