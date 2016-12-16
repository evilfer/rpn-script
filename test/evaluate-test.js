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
                "type": "wrapped",
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
                "callNamespace": {},
                "input": [],
                "output": [{
                    "type": "wrapped",
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
                ],
                "rhs": [
                    {
                        "type": "wrapped",
                        "index": 0,
                        expr: {
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
                ]
            }
            ]);
        });

        it('should indicate that expected wrapped expression cannot be inferred', () => {
            let {ordered: [a]} = build(`
             uwa1 = )( 1 +
        `, ops);

            expect(a.unknown).to.be.true;
        });

        it('should infer types of wrapped expression', () => {
            let {ordered: [a]} = build(`
             uwa1 = (+) )(
        `, ops);

            expect(a.unknown).not.to.be.true;

            expect(a.input).to.deep.eql([{"type": "number"}, {"type": "number"}]);
            expect(a.output).to.deep.eql([{"type": "number"}]);
        });

        it('should infer types of wrapped expression with named args', () => {
            let {ordered: [a]} = build(`
             x y uwa1 = x y (+) )(
        `, ops);

            expect(a.unknown).not.to.be.true;

            expect(a.input).to.deep.eql([{"type": "number"}, {"type": "number"}]);
            expect(a.output).to.deep.eql([{"type": "number"}]);
        });

        it('should evaluate fixed-count unwrap', () => {
            let {ordered: [{unknown, errors, input, output}]} = build(")2:1(");
            expect(errors).to.be.false;
            expect(unknown).not.to.be.true;
            expect(input).to.deep.equal([
                {type: 'any'},
                {type: 'any'},
                {
                    type: 'wrapped',
                    input: [{type: 'any'}, {type: 'any'}],
                    output: [{type: 'any'}]
                }]);
            expect(output).to.deep.equal([{type: 'any'}]);
        });

        it('should evaluate fixed-count unwrap (2)', () => {
            let {ordered: [{unknown, errors, input, output}]} = build(")0:2(", ops);
            expect(errors).to.be.false;
            expect(unknown).not.to.be.true;
            expect(input).to.deep.equal([{
                type: 'wrapped',
                input: [],
                output: [{type: 'any'}, {type: 'any'}]
            }]);
            expect(output).to.deep.equal([{type: 'any'}, {type: 'any'}]);
        });

        it('should evaluate fixed-count unwrap (3)', () => {
            let {ordered: [{unknown, errors, input, output}]} = build(")0:2( +", ops);
            expect(errors).to.be.false;
            expect(unknown).not.to.be.true;
            expect(input).to.deep.equal([{
                type: 'wrapped',
                input: [],
                output: [{type: 'number'}, {type: 'number'}]
            }]);
            expect(output).to.deep.equal([{type: 'number'}]);
        });

        it('should evaluate fixed-count unwrap (4)', () => {
            let {ordered: [{unknown, errors, input, output}]} = build(")0:2( )0:0(", ops);
            expect(errors).to.be.false;
            expect(unknown).not.to.be.true;
            expect(input).to.deep.equal([{
                type: 'wrapped',
                input: [],
                output: [{type: 'any'}, {
                    type: 'wrapped',
                    input: [],
                    output: []
                }]
            }]);
            expect(output).to.deep.equal([{type: 'any'}]);
        });

        it('should evaluate fixed-count unwrap (5)', () => {
            let {ordered: [{unknown, errors, input, output}]} = build(")0:2( )1:0(", ops);
            expect(errors).to.be.false;
            expect(unknown).not.to.be.true;
            expect(input).to.deep.equal([{
                type: 'wrapped',
                input: [],
                output: [{type: 'any'}, {
                    type: 'wrapped',
                    input: [{type: 'any'}],
                    output: []
                }]
            }]);
            expect(output).to.deep.equal([]);
        });

        it('should evaluate fixed-count unwrap (6)', () => {
            let {ordered: [{unknown, errors, input, output}]} = build(")0:2( )1:1( +", ops);
            expect(errors).to.be.false;
            expect(unknown).not.to.be.true;
            expect(input).to.deep.equal([
                {type: 'number'},
                {
                    type: 'wrapped',
                    input: [],
                    output: [
                        {type: 'any'},
                        {
                            type: 'wrapped',
                            input: [{type: 'any'}],
                            output: [{type: 'number'}]
                        }
                    ]
                }]);
            expect(output).to.deep.equal([{type: 'number'}]);
        });

        it('should evaluate fixed-count unwrap (7)', () => {
            let {ordered: [drop1, {unknown, errors, input, output}]} = build(`
                x drop1 =
                (1 (drop1)) )0:2( )1:0(
            `, ops);
            expect(errors).to.be.false;
            expect(unknown).not.to.be.true;
            expect(input).to.deep.equal([]);
            expect(output).to.deep.equal([]);
        });
    });

    describe('error management', () => {
        it('should detect error on numeric ops', () => {
            let {namespace: {x, y}} = build(`
                x = 1 1 +
                y = (1) 1 +
            `, ops);

            expect(x.errors).to.be.false;
            expect(y.errors).to.deep.eql([{type: 'BAD_TYPE'}]);
        });
    });
});
