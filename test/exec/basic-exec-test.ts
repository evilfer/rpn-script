import {expect} from 'chai';
import {Expression} from '../../src/model/expression';
import {OperatorList} from "../../src/model/operators/operator";
import {NumberOperator} from "../../src/model/operators/literal";

import {execTest} from './utils';


describe('basic operator exec', () => {
    describe('literal types', () => {

        it('should provide number literal type', () => {
            execTest('1 2.5', {}, [
                1,
                2.5
            ]);
        });

        it('should provide string literal type', () => {
            execTest('"a" "3"', {}, [
                'a',
                '3'
            ]);
        });

        it('should provide boolean literal type', () => {
            execTest('true false', {}, [
                true,
                false
            ]);
        });
    });

    describe('arrays', () => {
        it('should provide untyped array', () => {
            execTest('[]', {}, [
                []
            ]);
        });

        it('should provide literal type array', () => {
            execTest('[1]', {}, [
                [1]
            ]);
        });

        it('should provide multiple literal type array', () => {
            execTest('["1", "2"]', {}, [
                ['1', '2']
            ]);
        });

        it('should handle nested arrays', () => {
            execTest('[[]]', {}, [
                [[]]
            ]);
        });
    });

    describe('tuples', () => {
        it('should provide empty tuple', () => {
            execTest('()', {}, [
                []
            ]);
        });

        it('should provide literal tuple', () => {
            execTest('(1, "1")', {}, [
                [1, '1']
            ]);
        });
    });

    describe('wrapped', () => {
        it('should provide empty wrapped operators', () => {
            execTest('{}', {}, [
                []
            ]);
        });

        it('should provide literal wrapped operators', () => {
            let e = new Expression('{1}');
            let result = e.exec({});
            let [{val}] = result;

            expect(val).to.be.an('array');
            expect(val).to.have.length(1);
            expect((<OperatorList> val)[0].constructor).to.equal(NumberOperator);
        });
    });
});
