import {expect} from 'chai';
import {Expression} from '../../src/model/expression';

describe('expression parsing', () => {

    it('should parse simple code', () => {
        let e = new Expression('a b x = [1, a]');
        expect(e.name).to.equal('x');
        expect(e.namedArgs).to.deep.eql(['b', 'a']);
        expect(e.errors).to.be.false;
    });

    describe('syntax errors', () => {
        it('should fail on repeated argname', () => {
            let e = new Expression('a a x = [1, a]');
            expect(e.name).to.equal('x');
            expect(e.namedArgs).to.deep.eql(['a']);
            expect(e.errors).to.be.true;
        });

        it('should fail on repeated argname', () => {
            let e = new Expression('a a x = [1, a]');
            expect(e.name).to.equal('x');
            expect(e.namedArgs).to.deep.eql(['a']);
            expect(e.errors).to.be.true;
            expect(e.tokens[1].errors).to.deep.eql([{type: 'arg_repeated'}]);
        });

        it('should fail on argname as expr name', () => {
            let e = new Expression('a x x = [1, a]');
            expect(e.name).to.equal('x');
            expect(e.namedArgs).to.deep.eql(['a']);
            expect(e.errors).to.be.true;
            expect(e.tokens[1].errors).to.deep.eql([{type: 'arg_expr_name'}]);
        });

        it('should fail on unmatched opening array token', () => {
            let e = new Expression('[');
            expect(e.errors).to.be.true;
            expect(e.tokens[0].errors).to.deep.eql([{type: 'unmatched'}]);
        });

        it('should fail on unmatched closing token', () => {
            let e = new Expression('[)');
            expect(e.errors).to.be.true;
            expect(e.tokens[1].errors).to.deep.eql([{type: 'unmatched'}]);
        });

        it('should fail on comma token at top level', () => {
            let e = new Expression('a,3');
            expect(e.errors).to.be.true;
            expect(e.tokens[1].errors).to.deep.eql([{type: 'not_allowed'}]);
        });

        it('should fail on comma token as wrapped expression', () => {
            let e = new Expression('{a,3}');
            expect(e.errors).to.be.true;
            expect(e.tokens[2].errors).to.deep.eql([{type: 'not_allowed'}]);
        });
    });

    describe('operator parsing', () => {
        it('should create string operator', () => {
            let e = new Expression('"a"');
            expect(e.errors).to.be.false;
            expect(e.operators.length).to.equal(1);
            let [op] = e.operators;
            expect(op.constructor.name).to.equal('StringOperator');
            expect(op.value).to.equal('a');
        });

        it('should create number operator', () => {
            let e = new Expression('1.5');
            expect(e.errors).to.be.false;
            expect(e.operators.length).to.equal(1);
            let [op] = e.operators;
            expect(op.constructor.name).to.equal('NumberOperator');
            expect(op.value).to.equal(1.5);
        });

        it('should create ref operator', () => {
            let e = new Expression('a');
            expect(e.errors).to.be.false;
            expect(e.operators.length).to.equal(1);
            let [op] = e.operators;
            expect(op.constructor.name).to.equal('RefOperator');
            expect(op.ref).to.equal('a');
        });

        it('should create array operator', () => {
            let e = new Expression('[]');
            expect(e.errors).to.be.false;
            expect(e.operators.length).to.equal(1);
            let [op] = e.operators;
            expect(op.constructor.name).to.equal('ArrayOperator');
            expect(op.items.length).to.equal(0);
        });

        it('should create array operator with one element', () => {
            let e = new Expression('[1]');
            expect(e.errors).to.be.false;
            expect(e.operators.length).to.equal(1);
            let [op] = e.operators;
            expect(op.constructor.name).to.equal('ArrayOperator');
            expect(op.items.length).to.equal(1);
            let [item1ops] = op.items;
            expect(item1ops.length).to.equal(1);
            let [item1op] = item1ops;
            expect(item1op.constructor.name).to.equal('NumberOperator');
            expect(item1op.value).to.equal(1);
        });

        it('should create arg operator', () => {
            let e = new Expression('a x = a');
            expect(e.errors).to.be.false;
            expect(e.operators.length).to.equal(1);
            let [op] = e.operators;
            expect(op.constructor.name).to.equal('ArgOperator');
            expect(op.arg).to.equal('a');
        });
    });

    describe('applied', () => {
        it('should not create different operators if no named args', () => {
            let e = new Expression('1');
            let ops = e.appliedOperators();
            expect(ops).to.equal(e.operators);
        });

        it('should not create different operators if named args are not used', () => {
            let e = new Expression('x a = 1');
            let ops = e.appliedOperators();
            expect(ops).to.equal(e.operators);
        });

        it('should create different operators if named args are used', () => {
            let e = new Expression('x a = 1 x');
            let ops = e.appliedOperators({x: 'x_operand'});
            expect(ops).not.to.equal(e.operators);

            expect(ops.length).to.equal(2);
            let [n0, x0] = e.operators;
            let [n1, x1] = ops;

            expect(n1).to.equal(n0);

            expect(x1).not.to.equal(x0);
            expect(x1.constructor.name).to.equal('AppliedArgOperator');
            expect(x1.operand).to.equal('x_operand');
        });

        it('should create different operators if named args are used in nested operators', () => {
            let e = new Expression('x a = 1 [x, k]');
            let ops = e.appliedOperators({x: 'x_operand'});
            expect(ops).not.to.equal(e.operators);

            expect(ops.length).to.equal(2);
            let [n0, a0] = e.operators;
            let [n1, a1] = ops;

            let [[x0], [r0]] = a0.items;
            let [[x1], [r1]] = a1.items;

            expect(n1).to.equal(n0);
            expect(a1).not.to.equal(a0);
            expect(x1).not.to.equal(x0);
            expect(r1).to.equal(r0);

            expect(x1.constructor.name).to.equal('AppliedArgOperator');
            expect(x1.operand).to.equal('x_operand');
        });
    });

});
