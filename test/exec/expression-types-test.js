import {expect} from 'chai';
import {Expression} from '../../src/model/expression';
import debugTypesToString from '../../src/model/operands/debugTypesToString';


describe('type checking', () => {

    function runTest(code, result, namespace = null) {
        let e = new Expression(code);
        let context = e.runTypeCheck();
        let output = debugTypesToString(context).trim();

        expect(output).to.equal(result);
    }

    it('should check single number', () => {
        runTest('1', 'number');
    });

    it('should check multiple numbers', () => {
        runTest('1 2', 'number number');
    });

    it('should check single string', () => {
        runTest('"1"', 'string');
    });

    describe('with arrays', () => {
        it('should check simple number array', () => {
            runTest('[1]', '[number]');
        });

        it('should check empty array', () => {
            runTest('[]', 'A:[?]');
        });

        it('should check nested arrays (empty)', () => {
            runTest('[[]]', 'A:[B:[?]]');
        });
        it('should check nested arrays (number)', () => {
            runTest('[[2.1]]', '[[number]]');
        });
    });

    describe('with tuples', () => {
        it('should check empty tuple', () => {
            runTest('()', '()');
        });

        it('should check number 1-tuple', () => {
            runTest('(1)', '(number)');
        });

        it('should check mixed 4-tuple', () => {
            runTest('(1, , "a", 3 5)', '(number, , string, number number)');
        });

        it('should check nested arrays/tuples', () => {
            runTest('([1], ("a", []))', 'A:([number], B:(string, C:[?]))');
        });

        it('should check simple nested arrays/tuples', () => {
            runTest('([])', 'A:(B:[?])');
        });
    });

    describe('with named types', () => {
        it('should identify named args', () => {
            runTest('x y f =', 'A:any B:any ->');
        });
    });
});
