import {expect} from 'chai';
import parseCode from "../src/maths/parse-code";
import checkDependencies from "../src/maths/check-dependencies";
import evaluate from "../src/maths/evaluate";
import {} from "../src/maths/error-types";
import ops from "../src/maths/built-in/ops";

describe('evaluate', () => {

    const build = (code, globalNamespace) => evaluate(checkDependencies(parseCode(code, globalNamespace)));

    it('should evaluate simple expressions', () => {
        let {ordered: [a, b]} = build(`
            1
            1 2
        `);

        expect(a.input).to.deep.eql([]);
        expect(a.output).to.deep.eql([{type: 'number', value: 1}]);

        expect(b.input).to.deep.eql([]);
        expect(b.output).to.deep.eql([
            {type: 'number', value: 1},
            {type: 'number', value: 2}
        ]);
    });

    it('should evaluate expression with builtin op', () => {
        let {ordered: [a]} = build("1 1 +", ops);

        expect(a.input).to.deep.eql([]);
        expect(a.output).to.deep.eql([{type: 'number', value: 2}]);
    });

    it('should evaluate expression with missing operands', () => {
        let {ordered: [a]} = build("1 +", ops);

        expect(a.input).to.deep.eql([{type: 'number'}]);
        expect(a.output).to.deep.eql([{type: 'number'}]);
    });

    it('should evaluate expression with named arguments', () => {
        let {ordered: [a]} = build("x y drop =", ops);

        expect(a.input).to.deep.eql([{type: 'any'}, {type: 'any'}]);
        expect(a.output).to.deep.eql([]);
    });

    it('should evaluate expression with named arguments', () => {
        let {ordered: [a]} = build("x y replace = 1 2", ops);

        expect(a.input).to.deep.eql([{type: 'any'}, {type: 'any'}]);
        expect(a.output).to.deep.eql([{type: 'number', value: 1}, {type: 'number', value: 2}]);
    });

    it('should evaluate referenced expressions', () => {
        let {ordered: [, b]} = build(`
            add = +
            1 2 add
        `, ops);

        expect(b.input).to.deep.eql([]);
        expect(b.output).to.deep.eql([{type: 'number', value: 3}]);
    });

    it('should evaluate expression with mix of named/unnamed arguments', () => {
        let {ordered: [, b]} = build(`
            x y drop =
            x y replace = drop +
        `, ops);

        expect(b.input).to.deep.eql([
            {type: 'number'}, {type: 'number'},
            {type: 'any'}, {type: 'any'},
            {type: 'any'}, {type: 'any'}
        ]);
        expect(b.output).to.deep.eql([{type: 'number'}]);
    });

    it('should evaluate expression with mix of named/unnamed arguments', () => {
        let {ordered: [, b]} = build(`
            x y drop =
            drop +
        `, ops);

        expect(b.input).to.deep.eql([
            {type: 'number'}, {type: 'number'},
            {type: 'any'}, {type: 'any'}
        ]);
        expect(b.output).to.deep.eql([{type: 'number'}]);
    });

    it('should use named arguments', () => {
        let {ordered: [, b]} = build(`
            x y flip = y x
            1 2 flip +
        `, ops);

        expect(b.input).to.deep.eql([]);
        expect(b.output).to.deep.eql([{type: 'number', value: 3}]);
    });

    it('should keep separate call namespaces for different calls', () => {
        let {ordered: [, b]} = build(`
            x y flip = y x
            1 2 flip + 3 4 flip +
        `, ops);

        expect(b.input).to.deep.eql([]);
        expect(b.output).to.deep.eql([{type: 'number', value: 3}, {type: 'number', value: 7}]);
    });

    it('should keep separate call namespaces for in nested calls', () => {
        let {ordered: [, , c]} = build(`
            x y doNothing = x y
            x y flip = y x doNothing
            1 2 flip
        `, ops);

        expect(c.input).to.deep.eql([]);
        expect(c.output).to.deep.eql([{type: 'number', value: 2}, {type: 'number', value: 1}]);
    });

    describe('with wrapped expressions', () => {
        it('should include type of basic wrapped expression', () => {
            let {ordered: [a]} = build(`
            (1)
        `, ops);

            expect(a.input).to.deep.eql([]);
            expect(a.output).to.deep.eql([{
                "expr": {
                    "callNamespace": {},
                    "input": [],
                    "output": [
                        {
                            "type": "number",
                            "value": 1
                        }
                    ],
                    "rhs": [
                        {
                            "code": "1",
                            "type": "number",
                            "value": 1
                        }
                    ]
                },
                "type": "wrapped"
            }]);
        });

        it('should include type of basic wrapped/unwrapped expression', () => {
            let {ordered: [a]} = build(`
            (1) )(
        `, ops);
            expect(a.input).to.deep.eql([]);
            expect(a.output).to.deep.eql([{
                "type": "number",
                "value": 1
            }]);
        });

        it('should include type of double wrapped expression', () => {
            let {ordered: [a]} = build(`
            ((1))
        `, ops);

            expect(a.input).to.deep.eql([]);
            expect(a.output).to.deep.eql([{
                "type": "wrapped",
                "expr": {
                    "callNamespace": {},
                    "input": [],
                    "output": [{
                        "type": "wrapped",
                        "expr": {
                            "callNamespace": {},
                            "input": [],
                            "output": [
                                {
                                    "type": "number",
                                    "value": 1
                                }
                            ],
                            "rhs": [
                                {
                                    "code": "1",
                                    "type": "number",
                                    "value": 1
                                }
                            ]
                        }
                    }
                    ],
                    "rhs": [
                        {
                            "type": "wrapped",
                            "expr": {
                                "callNamespace": {},
                                "input": [],
                                "output": [
                                    {
                                        "type": "number",
                                        "value": 1
                                    }
                                ],
                                "rhs": [
                                    {
                                        "code": "1",
                                        "type": "number",
                                        "value": 1
                                    }
                                ]
                            },
                            "index": 0
                        }
                    ]
                }
            }
            ]);
        });
    });


    /*

     it('should identify type of expression with builtin op', () => {
     let {ordered: [a]} = build("1 1 +", ops);

     expect(a.argPop).to.equal(0);
     expect(a.argIn).to.deep.eql([]);
     expect(a.argOut).to.deep.eql([{type: 'number'}]);
     });

     it('should identify type of function expressions', () => {
     let {ordered: [a]} = build("1 +", ops);

     expect(a.argPop).to.equal(0);
     expect(a.argIn).to.deep.eql([{type: 'number'}]);
     expect(a.argOut).to.deep.eql([{type: 'number'}]);
     });


     it('should identify type of nested expressions', () => {
     let {ordered: [add1, a]} = build("add1 = 1 +\na = 1 add1", ops);

     expect(add1.argPop).to.equal(0);
     expect(add1.argIn).to.deep.eql([{type: 'number'}]);
     expect(add1.argOut).to.deep.eql([{type: 'number'}]);
     expect(a.argPop).to.equal(0);
     expect(a.argIn).to.deep.eql([]);
     expect(a.argOut).to.deep.eql([{type: 'number'}]);
     });

     it('should add generic type of declared args', () => {
     let {ordered: [{name, errors, argPop, argIn, argOut}]} = build("x y drop2 =", ops);

     expect(name).to.equal('drop2');
     expect(errors).to.equal(false);
     expect(argPop).to.equal(2);
     expect(argIn).to.deep.eql([{type: 'any'}, {type: 'any'}]);
     expect(argOut).to.deep.eql([]);
     });

     it('should identify type of declared args', () => {
     let {ordered: [{name, errors, argPop, argIn, argOut}]} = build("x y drop2 = y 1 +", ops);

     expect(name).to.equal('drop2');
     expect(errors).to.equal(false);
     expect(argPop).to.equal(2);
     expect(argIn).to.deep.eql([{type: 'any'}, {type: 'number'}]);
     expect(argOut).to.deep.eql([{type: 'number'}]);
     });

     describe('with wrapped expressions', () => {
     it('should identify type of wrapped expressions in stack', () => {
     let {ordered: [{argIn, argOut, wrapped: [w1]}]} = build("1 (+)", ops);

     expect(w1.argIn).to.deep.eql([{type: 'number'}, {type: 'number'}]);
     expect(w1.argOut).to.deep.eql([{type: 'number'}]);

     expect(argIn).to.deep.eql([]);
     expect(argOut).to.eql([{
     type: 'number'
     }, {
     type: 'wrapped',
     argIn: [{type: 'number'}, {type: 'number'}],
     argOut: [{type: 'number'}]
     }]);
     });

     it('should apply wrapped types by ref', () => {
     let {ordered: [a, b]} = build(`
     a = 1 (+)
     1 a
     `, ops);

     expect(a.argIn).to.deep.eql([]);
     expect(a.argOut).to.eql([{
     type: 'number'
     }, {
     type: 'wrapped',
     argIn: [{type: 'number'}, {type: 'number'}],
     argOut: [{type: 'number'}]
     }]);

     expect(b.argIn).to.deep.eql([]);
     expect(b.argOut).to.eql([{
     type: 'number'
     }, {
     type: 'number'
     }, {
     type: 'wrapped',
     argIn: [{type: 'number'}, {type: 'number'}],
     argOut: [{type: 'number'}]
     }]);
     });


     it('should identify type of nested wrapped expressions in stack', () => {
     let {ordered: [{argIn, argOut, wrapped: [w2, w1]}]} = build("1 (+(-))", ops);

     expect(w1.argIn).to.deep.eql([{type: 'number'}, {type: 'number'}]);
     expect(w1.argOut).to.deep.eql([{type: 'number'}, {
     type: 'wrapped',
     argIn: [{type: 'number'}, {type: 'number'}],
     argOut: [{type: 'number'}]
     }]);

     expect(w2.argIn).to.deep.eql([{type: 'number'}, {type: 'number'}]);
     expect(w2.argOut).to.deep.eql([{type: 'number'}]);

     expect(argIn).to.deep.eql([]);
     expect(argOut).to.eql([{
     type: 'number'
     }, {
     type: 'wrapped',
     argIn: [{type: 'number'}, {type: 'number'}],
     argOut: [{type: 'number'}, {
     type: 'wrapped',
     argIn: [{type: 'number'}, {type: 'number'}],
     argOut: [{type: 'number'}]
     }]
     }]);
     });

     it('should identify types reorganized through named args', () => {
     let {ordered: [, a]} = build(`
     x y flip = y x
     a = 1 2 flip
     `, ops);

     console.log(a);
     expect (true).to.be.false;
     });

     describe('and unwrap operator', () => {
     it('should identify type of wrapped expressions in stack', () => {
     let {ordered: [{rhs, argIn, argOut, wrapped: [w1]}]} = build("1 (+) )(", ops);

     expect(w1.argIn).to.deep.eql([{type: 'number'}, {type: 'number'}]);
     expect(w1.argOut).to.deep.eql([{type: 'number'}]);

     expect(argIn).to.deep.eql([{type: 'number'}]);
     expect(argOut).to.eql([{type: 'number'}]);
     });
     });

     });*/

})
;
