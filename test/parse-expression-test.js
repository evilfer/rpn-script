import {expect} from 'chai';
import parseExpression from "../src/maths/parse-expression";
import {MISSING_NAME, REPEAT_DEFINE, WRAP_IN_NAME, MISMATCHED_WRAP} from "../src/maths/error-types";

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

    it('should identify missing name', () => {
        expect(parseExpression(" = 1 2 + x *").errors).to.deep.eql([{type: MISSING_NAME}]);
        expect(parseExpression("= 1 2 + x *").errors).to.deep.eql([{type: MISSING_NAME}]);
    });

    it('should identify repeated =', () => {
        expect(parseExpression(" = 1 = 2 + x *").errors).to.deep.eql([{type: MISSING_NAME}, {type: REPEAT_DEFINE}]);
        expect(parseExpression("a = = 1 2 + x *").errors).to.deep.eql([{type: REPEAT_DEFINE}]);
        expect(parseExpression("a = ==").errors).to.equal(false);
        expect(parseExpression("== = a").errors).to.equal(false);
        expect(parseExpression("1 2 ==").errors).to.equal(false);
    });

    describe('wrapped expressions', () => {
        it('should identify token types (with errors)', () => {
            let {tokens} = parseExpression("x a = 1 2 + x (10 *) (");
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
                {type: 'wc', code: ')'},
                {type: 'wo', code: '('}
            ]);
        });

        it('should mark wrapping related operators before "=" as errors', () => {
            expect(parseExpression(")( a = 1 2 + x *").errors).to.deep.eql([{type: WRAP_IN_NAME}]);
            expect(parseExpression("( a = 1 2 + x *").errors).to.deep.eql([{type: WRAP_IN_NAME}]);
            expect(parseExpression(") a = 1 2 + x *").errors).to.deep.eql([{type: WRAP_IN_NAME}]);
            expect(parseExpression("() a = 1 2 + x *").errors).to.deep.eql([{type: WRAP_IN_NAME}]);
        });

        it('should identify mismatched wrappers', () => {
            expect(parseExpression("(1 2 (+) x *)").errors).to.equal(false);
            expect(parseExpression("(1 2 (+) x *").errors).to.deep.equal([{type: MISMATCHED_WRAP}]);
            expect(parseExpression("1 2 (+) x *)").errors).to.deep.equal([{type: MISMATCHED_WRAP}]);
            expect(parseExpression("(1 2 +) (x *)").errors).to.equal(false);
            expect(parseExpression("(1 2 +) + ) x (*").errors).to.deep.equal([{type: MISMATCHED_WRAP}]);
        });

        it('should wrap rhs tokens', () => {
            let {rhs, wrapped} = parseExpression("1 (10 *)");
            expect(rhs).deep.eql([{
                code: "1",
                type: "number",
                value: 1
            }, {
                type: 'wrapped',
                index: 0,
                expr: {
                    rhs: [{
                        code: "10",
                        type: "number",
                        value: 10
                    }, {
                        code: "*",
                        type: "expr",
                        name: "*"
                    }]
                }
            }]);

            expect(wrapped).to.deep.eql([{
                rhs: [{
                    code: "10",
                    type: "number",
                    value: 10
                }, {
                    code: "*",
                    type: "expr",
                    name: "*"
                }]
            }]);
        });


        it('should wrap nested rhs tokens', () => {
            let {rhs, wrapped} = parseExpression("1 (10 (+) *)");
            expect(rhs).deep.eql([{
                code: "1",
                type: "number",
                value: 1
            }, {
                type: 'wrapped',
                index: 1,
                expr: {
                    rhs: [{
                        code: "10",
                        type: "number",
                        value: 10
                    }, {
                        type: "wrapped",
                        index: 0,
                        expr: {
                            rhs: [{
                                code: "+",
                                type: "expr",
                                name: "+"
                            }]
                        }
                    }, {
                        code: "*",
                        type: "expr",
                        name: "*"
                    }]
                }
            }]);

            expect(wrapped).to.deep.eql([{
                rhs: [{
                    code: "+",
                    type: "expr",
                    name: "+"
                }]
            }, {
                rhs: [{
                    code: "10",
                    type: "number",
                    value: 10
                }, {
                    type: "wrapped",
                    index: 0,
                    expr: {
                        rhs: [{
                            code: "+",
                            type: "expr",
                            name: "+"
                        }]
                    }
                }, {
                    code: "*",
                    type: "expr",
                    name: "*"
                }]
            }]);
        });

        it('should identify unwrap', () => {
            let {rhs, errors} = parseExpression(")(");
            expect(errors).to.equal(false);
            expect(rhs).to.deep.equal([{type: 'unwrap', code: ')('}]);
        });

        it('should identify fixed-count unwrap', () => {
            let {rhs, errors} = parseExpression(")2:1(");
            expect(errors).to.equal(false);
            expect(rhs).to.deep.equal([{type: 'unwrap', code: ')2:1(', input: 2, output: 1}]);
        });

    });

});
