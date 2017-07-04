import {expect} from "chai";
import {Expression} from '../../src/model/expression';
import {OperationType} from "../../src/model/operands/operand-types";
import debugOpType2string from "../../src/model/operands/debug-operation-type-to-string";

describe('expression ref operator types', () => {
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

    describe('literal types', () => {
        it('should apply literal expr', () => {
            let e = new Expression('s');
            let type = e.getType(namespace);
            expect(type).to.deep.eq({
                input: [],
                output: [0],
                types: {
                    0: {type: 'string'}
                }
            });
            expect(debugOpType2string(type)).to.equal('string');
        });

        it('should apply multiple expr', () => {
            let e = new Expression('s n');
            let type = e.getType(namespace);
            expect(type).to.deep.eq({
                input: [],
                output: [0, 1],
                types: {
                    0: {type: 'string'},
                    1: {type: 'number'}
                }
            });
            expect(debugOpType2string(type)).to.equal('string number');
        });

        it('should use expressions in arrays', () => {
            let e = new Expression('[s]');
            let type = e.getType(namespace);
            expect(type).to.deep.eq({
                input: [],
                output: [1],
                types: {
                    0: {type: 'string'},
                    1: {
                        type: 'array',
                        array: 0
                    }
                }
            });
            expect(debugOpType2string(type)).to.equal('[string]');
        });

        it('should use expressions in wraps', () => {
            let e = new Expression('{s n}');
            let type = e.getType(namespace);
            expect(type).to.deep.eq({
                input: [],
                output: [2],
                types: {
                    0: {type: 'string'},
                    1: {type: 'number'},
                    2: {
                        type: 'wrapped',
                        wrapped: {input: [], output: [0, 1]}
                    }
                }
            });
            expect(debugOpType2string(type)).to.equal('{string number}');
        });

        it('should use expressions in tuples', () => {
            let e = new Expression('(n, s, n)');
            let type = e.getType(namespace);
            expect(type).to.deep.eq({
                input: [],
                output: [3],
                types: {
                    0: {type: 'number'},
                    1: {type: 'string'},
                    2: {type: 'number'},
                    3: {
                        type: 'tuple',
                        tuple: [0, 1, 2]
                    }
                }
            });
            expect(debugOpType2string(type)).to.equal('(number, string, number)');
        });
    });

    describe('function types', () => {
        it('should apply function expr', () => {
            let e = new Expression('add');
            let type = e.getType(namespace);
            expect(type).to.deep.eq({
                input: [0, 1],
                output: [2],
                types: {
                    0: {type: 'number'},
                    1: {type: 'number'},
                    2: {type: 'number'}
                }
            });
            expect(debugOpType2string(type)).to.equal('number number -> number');
        });

        it('should combine function expr', () => {
            let e = new Expression('add add');
            let type = e.getType(namespace);
            /* 2 == 4. both consumed */
            expect(type).to.deep.eq({
                input: [3, 0, 1],
                output: [5],
                types: {
                    0: {type: 'number'},
                    1: {type: 'number'},
                    3: {type: 'number'},
                    5: {type: 'number'}
                }
            });
            expect(debugOpType2string(type)).to.equal('number number number -> number');
        });

        it('should infer types of used operands', () => {
            let e = new Expression('switch add');
            let type = e.getType(namespace);

            expect(type).to.deep.eq({
                input: [0, 1],
                output: [4],
                types: {
                    0: {type: 'number'},
                    1: {type: 'number'},
                    4: {type: 'number'}
                }
            });
            expect(debugOpType2string(type)).to.equal('number number -> number');
        });

        it('should infer type of expected array', () => {
            let e = new Expression('0 arr_get " world" concat');
            let type = e.getType(namespace);

            expect(type).to.deep.eq({
                input: [1],
                output: [7],
                types: {
                    1: {
                        type: 'array',
                        array: 2
                    },
                    2: {type: 'string'},
                    7: {type: 'string'}
                }
            });
            expect(debugOpType2string(type)).to.equal('[string] -> string');
        });
    });
});
