import {expect} from 'chai';
import {Expression} from '../../src/model/expression';
import debugOpType2string from "../../src/model/operands/debug-operation-type-to-string";

describe('basic operator types', () => {
    describe('literal types', () => {

        it('should provide number literal type', () => {
            let e = new Expression('1 2.5');
            let type = e.getType({});

            expect(type).to.deep.eq({
                input: [],
                output: [0, 1],
                types: {
                    0: {
                        type: 'number'
                    },
                    1: {
                        type: 'number'
                    }
                }
            });

            expect(debugOpType2string(type)).to.equal('number number');
        });

        it('should provide string literal type', () => {
            let e = new Expression('"a" "3"');
            let type = e.getType({});
            expect(type).to.deep.eq({
                input: [],
                output: [0, 1],
                types: {
                    0: {
                        type: 'string'
                    },
                    1: {
                        type: 'string'
                    }
                }
            });

            expect(debugOpType2string(type)).to.equal('string string');
        });
    });

    describe('arrays', () => {
        it('should provide untyped array', () => {
            let e = new Expression('[]');
            let type = e.getType({});

            expect(type).to.deep.eq({
                input: [],
                output: [0],
                types: {
                    0: {
                        type: 'array',
                        array: null
                    }
                }
            });
            expect(debugOpType2string(type)).to.equal('A:[-]');
        });

        it('should provide literal type array', () => {
            let e = new Expression('[1]');
            let type = e.getType({});

            expect(type).to.deep.eq({
                input: [],
                output: [1],
                types: {
                    0: {
                        type: 'number'
                    },
                    1: {
                        type: 'array',
                        array: {input: [], output: [0]}
                    }
                }
            });
            expect(debugOpType2string(type)).to.equal('[number]');
        });

        it('should provide multiple literal type array', () => {
            let e = new Expression('[1 "1"]');
            let type = e.getType({});

            expect(type).to.deep.eq({
                input: [],
                output: [2],
                types: {
                    0: {
                        type: 'number'
                    },
                    1: {
                        type: 'string'
                    },
                    2: {
                        type: 'array',
                        array: {input: [], output: [0, 1]}
                    }
                }
            });
            expect(debugOpType2string(type)).to.equal('[number string]');
        });

        it('should handle nested arrays', () => {
            let e = new Expression('[[]]');
            let type = e.getType({});

            expect(type).to.deep.eq({
                input: [],
                output: [1],
                types: {
                    0: {
                        type: 'array',
                        array: null
                    },
                    1: {
                        type: 'array',
                        array: {input: [], output: [0]}
                    }
                }
            });
            expect(debugOpType2string(type)).to.equal('A:[B:[-]]');
        });
    });

    describe('tuples', () => {
        it('should provide empty tuple', () => {
            let e = new Expression('()');
            let type = e.getType({});

            expect(type).to.deep.eq({
                input: [],
                output: [0],
                types: {
                    0: {
                        type: 'tuple',
                        tuple: []
                    }
                }
            });
            expect(debugOpType2string(type)).to.equal('()');
        });

        it('should provide literal tuple', () => {
            let e = new Expression('(1, "1")');
            let type = e.getType({});

            expect(type).to.deep.eq({
                input: [],
                output: [2],
                types: {
                    0: {
                        type: 'number'
                    },
                    1: {
                        type: 'string'
                    },
                    2: {
                        type: 'tuple',
                        tuple: [{
                            input: [],
                            output: [0]
                        }, {
                            input: [],
                            output: [1]
                        }]
                    }
                }
            });
            expect(debugOpType2string(type)).to.equal('(number, string)');

        });
    });

    describe('wrapped', () => {
        it('should provide empty wrapped operators', () => {
            let e = new Expression('{}');
            let type = e.getType({});

            expect(type).to.deep.eq({
                input: [],
                output: [0],
                types: {
                    0: {
                        type: 'wrapped',
                        wrapped: {
                            input: [],
                            output: []
                        }
                    }
                }
            });
            expect(debugOpType2string(type)).to.equal('{}');
        });

        it('should provide literal wrapped operators', () => {
            let e = new Expression('{1}');
            let type = e.getType({});

            expect(type).to.deep.eq({
                input: [],
                output: [1],
                types: {
                    0: {
                        type: 'number'
                    },
                    1: {
                        type: 'wrapped',
                        wrapped: {
                            input: [],
                            output: [0]
                        }
                    }
                }
            });
            expect(debugOpType2string(type)).to.equal('{number}');
        });
    });

});
