import {expect} from 'chai';
import defaultBuild from "../src/build";
import ops from "../src/built-in/ops";

import {} from "../src/error-types";

describe('evaluate array expressions', () => {

    const build = code => defaultBuild(code, ops);

    it('should parse simple array', () => {
        let {namespace: {a: {evaluation: {input, output}}}} = build(`
                a = [1, 2]                
            `, ops);

        expect(input).to.deep.eql([]);
        expect(output).to.deep.eql([{
            type: 'array',
            value: [
                {
                    rhs: [{type: 'number', value: 1, code: '1'}],
                    evaluation: {input: [], output: [{type: 'number', value: 1}]}
                },
                {
                    rhs: [{type: 'number', value: 2, code: '2'}],
                    evaluation: {input: [], output: [{type: 'number', value: 2}]}
                }
            ]
        }]);
    });

    describe('range', () => {
        it('should create 1-long array', () => {
            let {namespace: {a: {evaluation: {input, output}}}} = build(`
                a = 1 range                
            `, ops);
            expect(input).to.deep.eql([]);
            expect(output).to.deep.eql([{
                type: 'array',
                value: [{
                    evaluation: {
                        input: [],
                        output: [{
                            type: 'number',
                            value: 0
                        }]
                    },
                    rhs: [{type: 'number', 'value': 0}]
                }
                ]
            }]);
        });

        it('should create 5-long array', () => {
            let {namespace: {a: {evaluation: {input, output}}}} = build(`
                a = 5 range                
            `, ops);
            expect(input).to.deep.eql([]);
            expect(output.length).to.equal(1);
            expect(output[0].type).to.equal('array');
            expect(output[0].value.length).to.equal(5);
            expect(output[0].value[0].evaluation.output).to.deep.eql([{type: 'number', value: 0}]);
            expect(output[0].value[2].evaluation.output).to.deep.eql([{type: 'number', value: 2}]);
            expect(output[0].value[4].evaluation.output).to.deep.eql([{type: 'number', value: 4}]);
        });
    });

    describe('map', () => {
        it('should map function to array', () => {
            let {namespace: {a, b}} = build(`
                a = [1, 2]
                b = a (1 +) map                                
            `, ops);

            expect(b.evaluation.input).to.deep.eql([]);
            expect(b.evaluation.output.length).to.equal(1);
            expect(b.evaluation.output[0].type).to.equal('array');
            expect(b.evaluation.output[0].value.length).to.equal(2);
            expect(b.evaluation.output[0].value[0].evaluation.output).to.deep.eql([{type: 'number', value: 2}]);
            expect(b.evaluation.output[0].value[1].evaluation.output).to.deep.eql([{type: 'number', value: 3}]);
        });

        it('should map function to array', () => {
            let {namespace: {a, b}} = build(`
                x ga = [x, 2]
                a = 1 ga
                b = a (1 +) map                                
            `, ops);

            expect(b.evaluation.input).to.deep.eql([]);
            expect(b.evaluation.output.length).to.equal(1);
            expect(b.evaluation.output[0].type).to.equal('array');
            expect(b.evaluation.output[0].value.length).to.equal(2);
            expect(b.evaluation.output[0].value[0].evaluation.output).to.deep.eql([{type: 'number', value: 2}]);
            expect(b.evaluation.output[0].value[1].evaluation.output).to.deep.eql([{type: 'number', value: 3}]);
        });

        it('should use named expressions', () => {
            let {namespace: {a, b}} = build(`
                a = [1, 2]
                add1 = 1 +
                b = a (add1) map                                
            `, ops);

            expect(b.evaluation.input).to.deep.eql([]);
            expect(b.evaluation.output.length).to.equal(1);
            expect(b.evaluation.output[0].type).to.equal('array');
            expect(b.evaluation.output[0].value.length).to.equal(2);
            expect(b.evaluation.output[0].value[0].evaluation.output).to.deep.eql([{type: 'number', value: 2}]);
            expect(b.evaluation.output[0].value[1].evaluation.output).to.deep.eql([{type: 'number', value: 3}]);
        });

        it('should use named parameters', () => {
            let {namespace: {a, b}} = build(`
                a = [1, 2]
                x add1 = x 1 +
                b = a (add1) map                                
            `, ops);

            expect(b.evaluation.input).to.deep.eql([]);
            expect(b.evaluation.output.length).to.equal(1);
            expect(b.evaluation.output[0].type).to.equal('array');
            expect(b.evaluation.output[0].value.length).to.equal(2);
            expect(b.evaluation.output[0].value[0].evaluation.output).to.deep.eql([{type: 'number', value: 2}]);
            expect(b.evaluation.output[0].value[1].evaluation.output).to.deep.eql([{type: 'number', value: 3}]);
        });

        it('should use named parameters (2)', () => {
            let {namespace: {a, b}} = build(`
                a = [1, 2]
                x duplicate = x x
                x mul2 = 2 x *
                x y add = y x +
                b = a (duplicate mul2 add) map                                
            `, ops);

            expect(b.evaluation.input).to.deep.eql([]);
            expect(b.evaluation.output.length).to.equal(1);
            expect(b.evaluation.output[0].type).to.equal('array');
            expect(b.evaluation.output[0].value.length).to.equal(2);
            expect(b.evaluation.output[0].value[0].evaluation.output).to.deep.eql([{type: 'number', value: 3}]);
            expect(b.evaluation.output[0].value[1].evaluation.output).to.deep.eql([{type: 'number', value: 6}]);
        });

        it('should use named parameters (3)', () => {
            let {namespace: {a, b}} = build(`
                    a = [1, 2]
                    x duplicate = x x
                    x mul2 = 2 x *
                    x y add = y x +
                    b = a (duplicate) map (mul2) map (add) map                                
            `, ops);

            expect(b.evaluation.input).to.deep.eql([]);
            expect(b.evaluation.output.length).to.equal(1);
            expect(b.evaluation.output[0].type).to.equal('array');
            expect(b.evaluation.output[0].value.length).to.equal(2);
            expect(b.evaluation.output[0].value[0].evaluation.output).to.deep.eql([{type: 'number', value: 3}]);
            expect(b.evaluation.output[0].value[1].evaluation.output).to.deep.eql([{type: 'number', value: 6}]);
        });

        it('should accept array of wrapped expressions', () => {
            let {namespace: {a, b}} = build(`
                    a = [(1), (2)]
                    b = a ( )( ) map                                
            `, ops);

            expect(b.evaluation.input).to.deep.eql([]);
            expect(b.evaluation.output.length).to.equal(1);
            expect(b.evaluation.output[0].type).to.equal('array');
            expect(b.evaluation.output[0].value.length).to.equal(2);
            expect(b.evaluation.output[0].value[0].evaluation.output).to.deep.eql([{type: 'number', value: 1}]);
            expect(b.evaluation.output[0].value[1].evaluation.output).to.deep.eql([{type: 'number', value: 2}]);
        });

        it('should accept array of wrapped expressions (2)', () => {
            let {namespace: {a, b}} = build(`
                    op x y preop = x y op )(
                    a = [(+), (*)]
                    b = a (1 2 preop) map                                
            `, ops);

            expect(b.evaluation.input).to.deep.eql([]);
            expect(b.evaluation.output.length).to.equal(1);
            expect(b.evaluation.output[0].type).to.equal('array');
            expect(b.evaluation.output[0].value.length).to.equal(2);
            expect(b.evaluation.output[0].value[0].evaluation.output).to.deep.eql([{type: 'number', value: 3}]);
            expect(b.evaluation.output[0].value[1].evaluation.output).to.deep.eql([{type: 'number', value: 2}]);
        });

        it('should operate on range arrays', () => {
            let {namespace: {a, b}} = build(`
                    a = 2 range
                    b = a (5 +) map                                
            `, ops);

            expect(b.evaluation.input).to.deep.eql([]);
            expect(b.evaluation.output.length).to.equal(1);
            expect(b.evaluation.output[0].type).to.equal('array');
            expect(b.evaluation.output[0].value.length).to.equal(2);
            expect(b.evaluation.output[0].value[0].evaluation.output).to.deep.eql([{type: 'number', value: 5}]);
            expect(b.evaluation.output[0].value[1].evaluation.output).to.deep.eql([{type: 'number', value: 6}]);
        });
    });

    describe('zip', () => {
        it('should map function to array', () => {
            let {namespace: {c}} = build(`
                a = [1, 2]
                b = [1 +, 3 +]
                c = a b zip                                
            `, ops);

            expect(c.evaluation.input).to.deep.eql([]);
            expect(c.evaluation.output.length).to.equal(1);
            expect(c.evaluation.output[0].type).to.equal('array');
            expect(c.evaluation.output[0].value.length).to.equal(2);
            expect(c.evaluation.output[0].value[0].evaluation.output).to.deep.eql([{type: 'number', value: 2}]);
            expect(c.evaluation.output[0].value[1].evaluation.output).to.deep.eql([{type: 'number', value: 5}]);
        });

        it('should allow building custom zipWith', () => {
            let {namespace: {c}} = build(`
                    a = [1, 2]
                    b = [10, 30]
                    op zipWith = zip op map
                   
                    c = a b (+) zipWith
                `, ops);

            expect(c.evaluation.input).to.deep.eql([]);
            expect(c.evaluation.output.length).to.equal(1);
            expect(c.evaluation.output[0].type).to.equal('array');
            expect(c.evaluation.output[0].value.length).to.equal(2);
            expect(c.evaluation.output[0].value[0].evaluation.output).to.deep.eql([{type: 'number', value: 11}]);
            expect(c.evaluation.output[0].value[1].evaluation.output).to.deep.eql([{type: 'number', value: 32}]);
        });
    });
});
