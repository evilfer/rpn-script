import {expect} from "chai";
import parseTokens from "../../src/parser/parse-tokens";

function check(codeStr: string, result: [[number, string]]) {
    expect(parseTokens(codeStr).map(({code, position}) => ({
        code,
        position,
    }))).to.deep.eq(result.map(([position, code]) => ({position, code})));
}

describe("parse tokens", () => {
    it("should parse simple", () => {
        check("x", [
            [0, "x"],
        ]);
    });

    it("should parse multiple tokens", () => {
        check("1 2 +", [
            [0, "1"],
            [2, "2"],
            [4, "+"],
        ]);
    });

    it("should parse extra spaces", () => {
        check("  1   2  +   ", [
            [2, "1"],
            [6, "2"],
            [9, "+"],
        ]);
    });

    it("should parse string", () => {
        check('"1"', [[0, '"1"']]);
    });

    it("should parse string and spaces", () => {
        check(' "1"', [[1, '"1"']]);
    });

    it("should parse string and ref", () => {
        check('a "1"', [[0, "a"], [2, '"1"']]);
    });

    it("should parse string with spaces", () => {
        check('"1 2"', [[0, '"1 2"']]);
    });

    it("should parse string with quotes", () => {
        check('"1 \\" 2"', [[0, '"1 \\" 2"']]);
    });

    it("should parse multiple tokens including string", () => {
        check('1 "a b c" concat', [
            [0, "1"],
            [2, '"a b c"'],
            [10, "concat"],
        ]);
    });

    it("should parse simple wrapped", () => {
        check("{1}", [
            [0, "{"],
            [1, "1"],
            [2, "}"],
        ]);
    });

    it("should parse wrap and unwrap", () => {
        check("{1} }{", [
            [0, "{"],
            [1, "1"],
            [2, "}"],
            [4, "}{"],
        ]);
    });

    it("should parse unwrap with arity", () => {
        check("{1} }0:1{", [
            [0, "{"],
            [1, "1"],
            [2, "}"],
            [4, "}0:1{"],
        ]);
    });

    it("should parse tuples", () => {
        check("(1) )0:1( 1", [
            [0, "("],
            [1, "1"],
            [2, ")"],
            [4, ")0:1("],
            [10, "1"],
        ]);
    });

    it("should parse array", () => {
        check('"a" [1,3 , 4, 6 7 +] apply', [
            [0, '"a"'],
            [4, "["],
            [5, "1"],
            [6, ","],
            [7, "3"],
            [9, ","],
            [11, "4"],
            [12, ","],
            [14, "6"],
            [16, "7"],
            [18, "+"],
            [19, "]"],
            [21, "apply"],
        ]);
    });

    it("should parse tuple and array", () => {
        check("([1,3]) )0:1(", [
            [0, "("],
            [1, "["],
            [2, "1"],
            [3, ","],
            [4, "3"],
            [5, "]"],
            [6, ")"],
            [8, ")0:1("],
        ]);
    });

    it("should parse string with trailing spaces", () => {
        check('"a b c  ', [[0, '"a b c  ']]);
    });

    it("should parse named args", () => {
        check("x y swap = y x", [
            [0, "x"],
            [2, "y"],
            [4, "swap"],
            [9, "="],
            [11, "y"],
            [13, "x"],
        ]);
    });

});
