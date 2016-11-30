import {expect} from 'chai';
import parseExpression from "../src/maths/parse-expression";

describe('parseExpression', () => {

    it('should identify no-name expr rhs tokens', () => {
        let {rhs, lhs, tokens, name, args} = parseExpression("1 2 +");

        expect(rhs).to.deep.eql([
            {type: 'number', value: 1, code: '1'},
            {type: 'number', value: 2, code: '2'},
            {type: 'expr', name: '+', code: '+'}
        ]);
        expect(name).to.be.null;
        expect(args).to.deep.eql([]);
        expect(lhs).to.deep.eql([]);
        expect(tokens).to.deep.eql(rhs);
    });

    it('should identify named expr lhs/rhs tokens', () => {
        let {rhs, lhs, name, args} = parseExpression("a = 1 2 +");

        expect(lhs).to.deep.eql([
            {type: 'name', code: 'a'}
        ]);

        expect(rhs).to.deep.eql([
            {type: 'number', value: 1, code: '1'},
            {type: 'number', value: 2, code: '2'},
            {type: 'expr', name: '+', code: '+'}
        ]);
        expect(name).to.equal("a");
        expect(args).to.deep.eql([]);
    });

    it('should identify named expr args/lhs/rhs tokens', () => {
        let {rhs, lhs, name, args, tokens} = parseExpression("x a = 1 2 + x *");

        expect(name).to.equal("a");
        expect(args).to.deep.eql(['x']);
        expect(lhs).to.deep.eql([
            {type: 'arg', name: 'x', code: 'x'},
            {type: 'name', code: 'a'}
        ]);
        expect(rhs).to.deep.eql([
            {type: 'number', value: 1, code: '1'},
            {type: 'number', value: 2, code: '2'},
            {type: 'expr', name: '+', code: '+'},
            {type: 'arg', name: 'x', code: 'x'},
            {type: 'expr', name: '*', code: '*'}
        ]);

        expect(tokens).to.deep.eql([
            {type: 'arg', name: 'x', code: 'x'},
            {type: 'name', code: 'a'},
            {type: 'assign', code: '='},
            {type: 'number', value: 1, code: '1'},
            {type: 'number', value: 2, code: '2'},
            {type: 'expr', name: '+', code: '+'},
            {type: 'arg', name: 'x', code: 'x'},
            {type: 'expr', name: '*', code: '*'}
        ]);
    });

    describe('wrapped expressions', () => {
        it('should identify token types', () => {
            let {tokens} = parseExpression("x a = 1 2 + x (10 *)");
            expect(tokens).to.deep.eql([
                {type: 'arg', name: 'x', code: 'x'},
                {type: 'name', code: 'a'},
                {type: 'assign', code: '='},
                {type: 'number', value: 1, code: '1'},
                {type: 'number', value: 2, code: '2'},
                {type: 'expr', name: '+', code: '+'},
                {type: 'arg', name: 'x', code: 'x'},
                {type: 'wo', code: '('},
                {type: 'number', value: 10, code: '10'},
                {type: 'expr', name: '*', code: '*'},
                {type: 'wc', code: ')'}
            ]);
        });
    });

});


