import {expect} from 'chai';
import defaultBuild from "../src/build";
import ops from "../src/built-in/ops";

import {} from "../src/error-types";

describe('evaluate wrapped expressions', () => {

    const build = code => defaultBuild(code, ops);

    it('should include type of basic wrapped expression', () => {
        let {ordered: [a]} = build(`
            (1)
        `, ops);

        expect(a.evaluation.input).to.deep.eql([]);
        expect(a.evaluation.output).to.deep.eql([{
            type: "wrapped",
            value: [
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
        expect(a.evaluation.input).to.deep.eql([]);
        expect(a.evaluation.output).to.deep.eql([{
            "type": "number",
            "value": 1
        }]);
    });

    it('should include type of double wrapped expression', () => {
        let {ordered: [a]} = build(`
            ((1))
        `, ops);

        expect(a.evaluation.input).to.deep.eql([]);
        expect(a.evaluation.output).to.deep.eql([{
            type: "wrapped",
            value: [{
                type: "wrapped",
                rhs: [{
                    type: "number",
                    value: 1,
                    code: "1"
                }]
            }]
        }]);
    });

    it('should include type of double wrapped expression (2)', () => {
        let {ordered: [a]} = build(`
            ((1)) )(
        `, ops);

        expect(a.evaluation.input).to.deep.eql([]);
        expect(a.evaluation.output).to.deep.eql([{
            type: "wrapped",
            value: [{
                code: "1",
                type: "number",
                value: 1
            }]
        }]);
    });

    it('should include type of double wrapped expression (3)', () => {
        let {ordered: [a]} = build(`
            ((1)) )( )(
        `, ops);

        expect(a.evaluation.input).to.deep.eql([]);
        expect(a.evaluation.output).to.deep.eql([{
            type: "number",
            value: 1
        }]);
    });

    it('should indicate that expected wrapped expression cannot be inferred', () => {
        let {ordered: [a]} = build(`
             uwa1 = )( 1 +
        `, ops);

        expect(a.evaluation.unknown).to.be.true;
    });

    it('should infer types of wrapped expression', () => {
        let {ordered: [a]} = build(`
             uwa1 = (+) )(
        `, ops);

        expect(a.evaluation.unknown).not.to.be.true;

        expect(a.evaluation.input).to.deep.eql([{"type": "number", value: null}, {"type": "number", value: null}]);
        expect(a.evaluation.output).to.deep.eql([{"type": "number", value: null}]);
    });

    it('should infer types of wrapped expression with named args', () => {
        let {ordered: [a]} = build(`
             x y uwa1 = x y (+) )(
        `, ops);

        expect(a.evaluation.unknown).not.to.be.true;

        expect(a.evaluation.input).to.deep.eql([{"type": "number", value: null}, {"type": "number", value: null}]);
        expect(a.evaluation.output).to.deep.eql([{"type": "number", value: null}]);
    });

    it('should evaluate fixed-count unwrap', () => {
        let {ordered: [{evaluation}]} = build(")2:1(");
        expect(evaluation.unknown).not.to.be.true;
        expect(evaluation.input).to.deep.equal([
            {type: 'any', value: null},
            {type: 'any', value: null},
            {
                type: 'wrapped',
                value: null,
                input: [{type: 'any', value: null}, {type: 'any', value: null}],
                output: [{type: 'any', value: null}]
            }]);
        expect(evaluation.output).to.deep.equal([{type: 'any', value: null}]);
    });

    it('should evaluate fixed-count unwrap (2)', () => {
        let {ordered: [{evaluation: {unknown, errors, input, output}}]} = build(")0:2(", ops);
        expect(errors).to.be.falsy;
        expect(unknown).not.to.be.true;
        expect(input).to.deep.equal([{
            type: 'wrapped',
            value: null,
            input: [],
            output: [{type: 'any', value: null}, {type: 'any', value: null}]
        }]);
        expect(output).to.deep.equal([{type: 'any', value: null}, {type: 'any', value: null}]);
    });

    it('should evaluate fixed-count unwrap (3)', () => {
        let {ordered: [{evaluation: {unknown, errors, input, output}}]} = build(")0:2( +", ops);
        expect(errors).to.be.falsy;
        expect(unknown).not.to.be.true;
        expect(input).to.deep.equal([{
            type: 'wrapped',
            value: null,
            input: [],
            output: [{type: 'number', value: null}, {type: 'number', value: null}]
        }]);
        expect(output).to.deep.equal([{type: 'number', value: null}]);
    });

    it('should evaluate fixed-count unwrap (4)', () => {
        let {ordered: [{evaluation: {unknown, errors, input, output}}]} = build(")0:2( )0:0(", ops);
        expect(errors).to.be.falsy;
        expect(unknown).not.to.be.true;
        expect(input).to.deep.equal([{
            type: 'wrapped',
            value: null,
            input: [],
            output: [
                {
                    type: 'any', value: null
                }, {
                    type: 'wrapped',
                    value: null,
                    input: [],
                    output: []
                }]
        }]);
        expect(output).to.deep.equal([{type: 'any', value: null}]);
    });

    it('should evaluate fixed-count unwrap (5)', () => {
        let {ordered: [{evaluation: {unknown, errors, input, output}}]} = build(")0:2( )1:0(", ops);
        expect(errors).to.be.falsy;
        expect(unknown).not.to.be.true;
        expect(input).to.deep.equal([{
            type: 'wrapped',
            value: null,
            input: [],
            output: [{type: 'any', value: null}, {
                type: 'wrapped',
                value: null,
                input: [{type: 'any', value: null}],
                output: []
            }]
        }]);
        expect(output).to.deep.equal([]);
    });

    it('should evaluate fixed-count unwrap (6)', () => {
        let {ordered: [{evaluation: {unknown, errors, input, output}}]} = build(")0:2( )1:1( +", ops);
        expect(errors).to.be.falsy;
        expect(unknown).not.to.be.true;
        expect(input).to.deep.equal([
            {type: 'number', value: null},
            {
                type: 'wrapped', value: null,
                input: [],
                output: [
                    {type: 'any', value: null},
                    {
                        type: 'wrapped', value: null,
                        input: [{type: 'any', value: null}],
                        output: [{type: 'number', value: null}]
                    }
                ]
            }]);
        expect(output).to.deep.equal([{type: 'number', value: null}]);
    });

    it('should evaluate fixed-count unwrap (7)', () => {
        let {ordered: [drop1, {evaluation: {unknown, errors, input, output}}]} = build(`
                x drop1 =
                (1 (drop1)) )0:2( )1:0(
            `, ops);
        expect(errors).to.be.falsy;
        expect(unknown).not.to.be.true;
        expect(input).to.deep.equal([]);
        expect(output).to.deep.equal([]);
    });
});
