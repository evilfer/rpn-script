import {expect} from 'chai';
import {Expression} from '../../src/model/expression';
import debugOpType2string from "../../src/model/operands/debug-operation-type-to-string";
import {OperationType} from "../../src/model/operands/operand-types";

describe('unwrap operator types', () => {
    let namespace: { [name: string]: OperationType };

    beforeEach(() => {
        namespace = {
            's': {
                input: [],
                output: [0],
                types: {
                    0: {type: 'string'}
                }
            },
            'n': {
                input: [],
                output: [0],
                types: {
                    0: {type: 'number'}
                }
            },
            'add': {
                input: [0, 1],
                output: [2],
                types: {
                    0: {type: 'number'},
                    1: {type: 'number'},
                    2: {type: 'number'}
                }
            },
            'concat': {
                input: [0, 1],
                output: [2],
                types: {
                    0: {type: 'string'},
                    1: {type: 'string'},
                    2: {type: 'string'}
                }
            },
            'switch': {
                input: [0, 1],
                output: [1, 0],
                types: {
                    0: {type: null},
                    1: {type: null}
                }
            },
            'arr_get': {
                input: [0, 2],
                output: [1],
                types: {
                    0: {
                        type: 'array',
                        array: 1
                    },
                    1: {type: null},
                    2: {type: 'number'}
                }
            }
        };
    });

    it('should provide unwrap types without wrapped operand', () => {
        let e = new Expression('}1:2{');
        let type = e.getType({});

        expect(debugOpType2string(type)).to.equal('A:? -> B:? C:?');
    });

    it('should provide unwrap types with wrapped operand', () => {
        let e = new Expression('{add} }2:1{');
        let type = e.getType(namespace);

        expect(debugOpType2string(type)).to.equal('number number -> number');
    });

    it('should provide unwrap types with wrapped operand involving undefined types', () => {
        let e = new Expression('{arr_get} }2:1{');
        let type = e.getType(namespace);

        expect(debugOpType2string(type)).to.equal('A:[B:?] number -> B:?');
    });

    it('should provide unwrap types with wrapped operand involving undefined types and their refinement', () => {
        let e = new Expression('0 {arr_get} }2:1{ 1 add');
        let type = e.getType(namespace);

        expect(debugOpType2string(type)).to.equal('[number] -> number');
    });

});
