import {expect} from 'chai';
import parseCode from "../src/maths/parse-code";
import checkDependencies from "../src/maths/check-dependencies";
import identifyTypes from "../src/maths/identify-types";
import reduce from "../src/maths/reduce";
import {} from "../src/maths/error-types";
import ops from "../src/maths/built-in/ops";

describe('reduce', () => {

    const build = (code, globalNamespace) => reduce(identifyTypes(checkDependencies(parseCode(code, globalNamespace))));

    it('should reduce simple values', () => {
        let {ordered: [a, b]} = build("1\n1 2");

        expect(a.reduced).to.equal(true);
        expect(a.value).to.equal(1);

        expect(b.reduced).to.equal(false);
    });

    it('should reduce built in ops', () => {
        let {ordered: [a]} = build("1 1 +", ops);

        expect(a.reduced).to.equal(true);
        expect(a.value).to.equal(2);
    });


    it('should reduce nested expressions', () => {
        let {ordered: [add1, mul2, x]} = build("add1 = 1 +\nx mul2 = 2 x *\nx = 5 add1 mul2", ops);

        expect(x.reduced).to.equal(true);
        expect(x.value).to.equal(12);
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
        it('should not evaluate wrapped expressions', () => {
            let {ordered: [{reduced}]} = build("1 1 (+)", ops);
            expect(reduced).to.be.false;
        });

        it('should evaluate expressions on unwrap', () => {
            let {ordered: [{reduced}]} = build("1 1 (+) )(", ops);
            expect(reduced).to.be.true;
        });

        it('should evaluate expressions on unwrap by ref', () => {
            let {ordered: [a, b]} = build(`
            a = 1 1 (+)
            a )(
            `, ops);
            expect(a.reduced).to.be.false;
            expect(b.reduced).to.be.true;
        });
    });

});


