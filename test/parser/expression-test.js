import {expect} from 'chai';
import {Expression} from '../../src/model/expression';

describe('expression parsing', () => {

    it('should parse simple code', () => {
        let e = new Expression('a b x = [1, a]');
        expect(e.name).to.equal('x');
        expect(e.namedArgs).to.deep.eql(['a', 'b']);
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
    });

});
