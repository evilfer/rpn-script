import {expect} from 'chai';
import {Expression} from '../../src/model/expression';
import {NumberOperator, StringOperator} from "../../src/model/operators/literal";
import {RefOperator} from "../../src/model/operators/ref";
import {ArrayOperator} from "../../src/model/operators/comma-sep";
import {AppliedArgOperator, ArgOperator} from "../../src/model/operators/arg";
import {OperationType} from "../../src/model/operands/operand-types";

describe('operator types', () => {
    let currentType: OperationType;

    beforeEach(() => {
        currentType = {
            input: [],
            output: [],
            types: {}
        };
    });

    describe('literal types', () => {

        it('should provide number literal type', () => {
            let e = new Expression('1 2.5');
            let [a, b] = e.operators;

            expect(a.getType(currentType, {})).to.deep.eq({
                input: [],
                output: [0],
                types: {
                    0: {
                        type: 'number'
                    }
                }
            });

            expect(b.getType(currentType, {})).to.deep.eq({
                input: [],
                output: [0],
                types: {
                    0: {
                        type: 'number'
                    }
                }
            });
        });

        it('should provide string literal type', () => {
            let e = new Expression('"a" "3"');
            let [a, b] = e.operators;

            expect(a.getType(currentType, {})).to.deep.eq({
                input: [],
                output: [0],
                types: {
                    0: {
                        type: 'string'
                    }
                }
            });

            expect(b.getType(currentType, {})).to.deep.eq({
                input: [],
                output: [0],
                types: {
                    0: {
                        type: 'string'
                    }
                }
            });
        });
    });

    describe('arrays', () => {
        it('should provide untyped array', () => {
            let e = new Expression('[]');

            let [a] = e.operators;

            expect(a.getType(currentType, {})).to.deep.eq({
                input: [],
                output: [0],
                types: {
                    0: {
                        type: 'array',
                        array: null
                    }
                }
            });
        });

        it('should provide literal type array', () => {
            let e = new Expression('[1]');

            let [a] = e.operators;

            expect(a.getType(currentType, {})).to.deep.eq({
                input: [],
                output: [0],
                types: {
                    0: {
                        type: 'array',
                        array: {input: [], output: [1]}
                    },
                    1: {
                        type: 'number'
                    }
                }
            });
        });
    });

});
