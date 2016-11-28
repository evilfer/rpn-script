import {expect} from 'chai';
import parseCode from "../src/maths/parse-code";
import checkDependencies from "../src/maths/check-dependencies";
import identifyTypes from "../src/maths/identify-types";
import {} from "../src/maths/error-types";
import ops from "../src/maths/built-in/ops";

describe('identifyTypes', () => {

    const build = (code, globalNamespace) => identifyTypes(checkDependencies(parseCode(code, globalNamespace)));

    it('should identify type of simple expression', () => {
        let {ordered: [a, b]} = build("1\n1 2");

        expect(a.argPop).to.equal(0);
        expect(a.argIn).to.deep.eql([]);
        expect(a.argOut).to.deep.eql([{type: 'number'}]);

        expect(b.argPop).to.equal(0);
        expect(b.argIn).to.deep.eql([]);
        expect(b.argOut).to.deep.eql([{type: 'number'}, {type: 'number'}]);
    });

    it('should identify type of simple expression', () => {
        let {ordered: [a, b]} = build("1\n1 2");

        expect(a.argPop).to.equal(0);
        expect(a.argIn).to.deep.eql([]);
        expect(a.argOut).to.deep.eql([{type: 'number'}]);

        expect(b.argPop).to.equal(0);
        expect(b.argIn).to.deep.eql([]);
        expect(b.argOut).to.deep.eql([{type: 'number'}, {type: 'number'}]);
    });

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

});


