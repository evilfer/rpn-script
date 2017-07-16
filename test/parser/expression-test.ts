/* tslint:disable */

import {expect} from "chai";
import {Expression} from "../../src/model/expression";
import {ArgOperator} from "../../src/model/operators/arg/arg";
import {ArrayOperator} from "../../src/model/operators/array";
import {RefOperator} from "../../src/model/operators/ref";
import {StringOperator} from "../../src/model/operators/literal/string";
import {BooleanOperator} from "../../src/model/operators/literal/boolean";
import {NumberOperator} from "../../src/model/operators/literal/number";
import {AppliedArgOperator} from "../../src/model/operators/arg/applied-arg";

describe("expression parsing", () => {
    it("should parse simple code", () => {
        const e = new Expression("a b x = [1, a]");
        expect(e.name).to.equal("x");
        expect(e.namedArgs).to.deep.eq(["b", "a"]);
        expect(e.errors).to.be.false;
    });

    describe("error management", () => {

        it("should fail on repeated argname", () => {
            const e = new Expression("a a x = [1, a]");
            expect(e.name).to.equal("x");
            expect(e.namedArgs).to.deep.eq(["a"]);
            expect(e.errors).to.be.true;
            expect(e.tokens[1].errors).to.deep.eq([{type: "arg_repeated"}]);
        });

        it("should fail on argname as expr name", () => {
            const e = new Expression("a x x = [1, a]");
            expect(e.name).to.equal("x");
            expect(e.namedArgs).to.deep.eq(["a"]);
            expect(e.errors).to.be.true;
            expect(e.tokens[1].errors).to.deep.eq([{type: "arg_expr_name"}]);
        });

        it("should fail on unmatched opening array token", () => {
            const e = new Expression("[");
            expect(e.errors).to.be.true;
            expect(e.tokens[0].errors).to.deep.eq([{type: "unmatched"}]);
        });

        it("should fail on unmatched closing token", () => {
            const e = new Expression("[)");
            expect(e.errors).to.be.true;
            expect(e.tokens[1].errors).to.deep.eq([{type: "unmatched"}]);
        });

        it("should fail on comma token at top level", () => {
            const e = new Expression("a,3");
            expect(e.errors).to.be.true;
            expect(e.tokens[1].errors).to.deep.eq([{type: "not_allowed"}]);
        });

        it("should fail on comma token as wrapped expression", () => {
            const e = new Expression("{a,3}");
            expect(e.errors).to.be.true;
            expect(e.tokens[2].errors).to.deep.eq([{type: "not_allowed"}]);
        });
    });

    describe("with simple operators", () => {
        it("should create string operator", () => {
            const e = new Expression('"a"');
            expect(e.errors).to.be.false;
            expect(e.operators.length).to.equal(1);
            const [op] = e.operators;
            expect(op.constructor.name).to.equal("StringOperator");
            expect((op as StringOperator).value).to.equal("a");
        });

        it("should create boolean operators", () => {
            const e = new Expression("false true");
            expect(e.errors).to.be.false;
            expect(e.operators.length).to.equal(2);
            const [f, t] = e.operators;
            expect(f.constructor.name).to.equal("BooleanOperator");
            expect(t.constructor.name).to.equal("BooleanOperator");
            expect((f as BooleanOperator).value).to.equal(false);
            expect((t as BooleanOperator).value).to.equal(true);
        });

        it("should create number operator", () => {
            const e = new Expression("1.5");
            expect(e.errors).to.be.false;
            expect(e.operators.length).to.equal(1);
            const [op] = e.operators;
            expect(op.constructor.name).to.equal("NumberOperator");
            expect((op as NumberOperator).value).to.equal(1.5);
        });

        it("should create ref operator", () => {
            const e = new Expression("a");
            expect(e.errors).to.be.false;
            expect(e.operators.length).to.equal(1);
            const [op] = e.operators;
            expect(op.constructor.name).to.equal("RefOperator");
            expect((op as RefOperator).ref).to.equal("a");
        });
    });

    describe("with arrays", () => {

        it("should create array operator", () => {
            const e = new Expression("[]");
            expect(e.errors).to.be.false;
            expect(e.operators.length).to.equal(1);
            const [op] = e.operators;
            expect(op.constructor.name).to.equal("ArrayOperator");
            expect((op as ArrayOperator).items.length).to.equal(0);
        });

        it("should create array operator with one element", () => {
            const e = new Expression("[1]");
            expect(e.errors).to.be.false;
            expect(e.operators.length).to.equal(1);
            const [op] = e.operators;
            expect(op.constructor.name).to.equal("ArrayOperator");
            const items = (op as ArrayOperator).items;
            expect(items.length).to.equal(1);
            const [item1ops] = items;
            expect(item1ops.length).to.equal(1);
            const [item1op] = item1ops;
            expect(item1op.constructor.name).to.equal("NumberOperator");
            expect((item1op as NumberOperator).value).to.equal(1);
        });
    });

    describe("with argument names", () => {

        it("should create arg operator", () => {
            const e = new Expression("a x = a");
            expect(e.errors).to.be.false;
            expect(e.operators.length).to.equal(1);
            const [op] = e.operators;
            expect(op.constructor.name).to.equal("ArgOperator");
            expect((op as ArgOperator).arg).to.equal("a");
        });
    });

    describe("applied operator creation", () => {
        it("should not create different operators if no named args", () => {
            const e = new Expression("1");
            const ops = e.appliedTypeOperators();
            expect(ops).to.equal(e.operators);
        });

        it("should not create different operators if named args are not used", () => {
            const e = new Expression("x a = 1");
            const ops = e.appliedTypeOperators();
            expect(ops).to.equal(e.operators);
        });

        it("should create different operators if named args are used", () => {
            const e = new Expression("x a = 1 x");
            const ops = e.appliedTypeOperators({x: 0});
            expect(ops).not.to.equal(e.operators);

            expect(ops.length).to.equal(2);
            const [n0, x0] = e.operators;
            const [n1, x1] = ops;

            expect(n1).to.equal(n0);

            expect(x1).not.to.equal(x0);
            expect(x1.constructor.name).to.deep.eq("TypeAppliedArgOperator");
            expect((x1 as AppliedArgOperator<string>).operand).to.deep.eq(0);
        });

        it("should create different operators if named args are used in nested operators", () => {
            const e = new Expression("x a = 1 [x, k]");
            const ops = e.appliedTypeOperators({x: 0});
            expect(ops).not.to.equal(e.operators);

            expect(ops.length).to.equal(2);
            const [n0, a0] = e.operators;
            const [n1, a1] = ops;

            const [[x0], [r0]] = (a0 as ArrayOperator).items;
            const [[x1], [r1]] = (a1 as ArrayOperator).items;

            expect(n1).to.equal(n0);
            expect(a1).not.to.equal(a0);
            expect(x1).not.to.equal(x0);
            expect(r1).to.equal(r0);

            expect(x1.constructor.name).to.equal("TypeAppliedArgOperator");
            expect((x1 as AppliedArgOperator<string>).operand).to.deep.eq(0);
        });
    });
});
