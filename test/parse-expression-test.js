import {expect} from 'chai';
import parseExpression from "../src/parse-expression";

describe('parseExpression', () => {

    it('should identify no-name expr rhs tokens', () => {
        let {rhs, name, args} = parseExpression("1 2 +");

        expect(rhs).to.deep.eql([
            {type: 'value', value: 1},
            {type: 'value', value: 2},
            {type: 'expr', name: '+'}
        ]);
        expect(name).to.be.null;
        expect(args).to.deep.eql([]);
    });

    it('should identify named expr lhs/rhs tokens', () => {
        let {rhs, name, args} = parseExpression("a = 1 2 +");

        expect(rhs).to.deep.eql([
            {type: 'value', value: 1},
            {type: 'value', value: 2},
            {type: 'expr', name: '+'}
        ]);
        expect(name).to.equal("a");
        expect(args).to.deep.eql([]);
    });

});


