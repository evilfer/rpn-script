import {expect} from 'chai';
import defaultBuild from "../src/build";
import ops from "../src/built-in/ops";

import {} from "../src/error-types";

describe('evaluate', () => {

    const build = code => defaultBuild(code, ops);

    it('should evaluate simple expressions', () => {
        let {ordered: [a, b]} = build(`
            1
            1 2
        `);

        expect(a.evaluation.input).to.deep.eql([]);
        expect(a.evaluation.output).to.deep.eql([{type: 'number', value: 1}]);

        expect(b.evaluation.input).to.deep.eql([]);
        expect(b.evaluation.output).to.deep.eql([
            {type: 'number', value: 1},
            {type: 'number', value: 2}
        ]);
    });

    it('should evaluate expression with builtin op', () => {
        let {ordered: [a]} = build("1 1 +", ops);

        expect(a.evaluation.input).to.deep.eql([]);
        expect(a.evaluation.output).to.deep.eql([{type: 'number', value: 2}]);
    });

    it('should evaluate expression with missing operands', () => {
        let {ordered: [a]} = build("1 +", ops);

        expect(a.evaluation.input).to.deep.eql([{type: 'number', value: null}]);
        expect(a.evaluation.output).to.deep.eql([{type: 'number', value: null}]);
    });

    it('should evaluate expression with named arguments', () => {
        let {ordered: [a]} = build("x y drop =", ops);

        expect(a.evaluation.input).to.deep.eql([{type: 'any', value: null}, {type: 'any', value: null}]);
        expect(a.evaluation.output).to.deep.eql([]);
    });

    it('should evaluate expression with named arguments', () => {
        let {ordered: [a]} = build("x y replace = 1 2", ops);

        expect(a.evaluation.input).to.deep.eql([{type: 'any', value: null}, {type: 'any', value: null}]);
        expect(a.evaluation.output).to.deep.eql([{type: 'number', value: 1}, {type: 'number', value: 2}]);
    });

    it('should evaluate referenced expressions', () => {
        let {ordered: [, b]} = build(`
            add = +
            1 2 add
        `, ops);

        expect(b.evaluation.input).to.deep.eql([]);
        expect(b.evaluation.output).to.deep.eql([{type: 'number', value: 3}]);
    });

    it('should evaluate expression with mix of named/unnamed arguments', () => {
        let {ordered: [, b]} = build(`
            x y drop =
            x y replace = drop +
        `, ops);

        expect(b.evaluation.input).to.deep.eql([
            {type: 'number', value: null}, {type: 'number', value: null},
            {type: 'any', value: null}, {type: 'any', value: null},
            {type: 'any', value: null}, {type: 'any', value: null}
        ]);
        expect(b.evaluation.output).to.deep.eql([{type: 'number', value: null}]);
    });

    it('should evaluate expression with mix of named/unnamed arguments', () => {
        let {ordered: [, b]} = build(`
            x y drop =
            drop +
        `, ops);

        expect(b.evaluation.input).to.deep.eql([
            {type: 'number', value: null}, {type: 'number', value: null},
            {type: 'any', value: null}, {type: 'any', value: null}
        ]);
        expect(b.evaluation.output).to.deep.eql([{type: 'number', value: null}]);
    });

    it('should use named arguments', () => {
        let {ordered: [, b]} = build(`
            x y flip = y x
            1 2 flip +
        `, ops);

        expect(b.evaluation.input).to.deep.eql([]);
        expect(b.evaluation.output).to.deep.eql([{type: 'number', value: 3}]);
    });

    it('should keep separate call namespaces for different calls', () => {
        let {ordered: [, b]} = build(`
            x y flip = y x
            1 2 flip + 3 4 flip +
        `, ops);

        expect(b.evaluation.input).to.deep.eql([]);
        expect(b.evaluation.output).to.deep.eql([{type: 'number', value: 3}, {type: 'number', value: 7}]);
    });

    it('should keep separate call namespaces for in nested calls', () => {
        let {ordered: [, , c]} = build(`
            x y doNothing = x y
            x y flip = y x doNothing
            1 2 flip
        `, ops);

        expect(c.evaluation.input).to.deep.eql([]);
        expect(c.evaluation.output).to.deep.eql([{type: 'number', value: 2}, {type: 'number', value: 1}]);
    });

    describe('error management', () => {
        it('should detect error on numeric ops', () => {
            let {namespace: {x, y}} = build(`
                x = 1 1 +
                y = (1) 1 +
            `, ops);

            expect(x.evaluation.errors).to.be.falsy;
            expect(y.evaluation.errors).to.deep.eql([{type: 'BAD_TYPE'}]);
        });
    });

});