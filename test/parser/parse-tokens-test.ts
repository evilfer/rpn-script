import {suite, test, slow, timeout} from 'mocha-typescript';
import {expect} from 'chai';
import parseTokens from '../../src/parser/parse-tokens';


@suite
class ParseTokens {

    static check(code: string, result: [[number, string]]) {
        expect(parseTokens(code).map(({code, position}) => ({
            code,
            position
        }))).to.deep.eq(result.map(([position, code]) => ({position, code})));
    }

    @test simple() {
        ParseTokens.check('x', [
            [0, 'x']
        ]);
    }

    @test multipleTokens() {
        ParseTokens.check('1 2 +', [
            [0, '1'],
            [2, '2'],
            [4, '+']
        ]);
    }

    @test extraSpaces() {
        ParseTokens.check('  1   2  +   ', [
            [2, '1'],
            [6, '2'],
            [9, '+']
        ]);
    }

    @test string() {
        ParseTokens.check('"1"', [[0, '"1"']]);
    }

    @test stringAndSpaces() {
        ParseTokens.check(' "1"', [[1, '"1"']]);
    }

    @test stringAndRef() {
        ParseTokens.check('a "1"', [[0, 'a'], [2, '"1"']]);
    }


    @test stringWithSpaces() {
        ParseTokens.check('"1 2"', [[0, '"1 2"']]);
    }

    @test stringWithQuotes() {
        ParseTokens.check('"1 \\" 2"', [[0, '"1 \\" 2"']]);
    }

    @test multipleTokensIncludingString() {
        ParseTokens.check('1 "a b c" concat', [
            [0, '1'],
            [2, '"a b c"'],
            [10, 'concat']
        ]);
    }

    @test simpleWrapped() {
        ParseTokens.check('{1}', [
            [0, '{'],
            [1, '1'],
            [2, '}']
        ]);
    }

    @test wrapAndUnwrap() {
        ParseTokens.check('{1} }{', [
            [0, '{'],
            [1, '1'],
            [2, '}'],
            [4, '}{']
        ]);
    }

    @test unwrapWithArity() {
        ParseTokens.check('{1} }0:1{', [
            [0, '{'],
            [1, '1'],
            [2, '}'],
            [4, '}0:1{']
        ]);
    }

    @test tuples() {
        ParseTokens.check('(1) )0:1( 1', [
            [0, '('],
            [1, '1'],
            [2, ')'],
            [4, ')0:1('],
            [10, '1']
        ]);
    }

    @test array() {
        ParseTokens.check('"a" [1,3 , 4, 6 7 +] apply', [
            [0, '"a"'],
            [4, '['],
            [5, '1'],
            [6, ','],
            [7, '3'],
            [9, ','],
            [11, '4'],
            [12, ','],
            [14, '6'],
            [16, '7'],
            [18, '+'],
            [19, ']'],
            [21, 'apply']
        ]);
    }

    @test tupleAndArray() {
        ParseTokens.check('([1,3]) )0:1(', [
            [0, '('],
            [1, '['],
            [2, '1'],
            [3, ','],
            [4, '3'],
            [5, ']'],
            [6, ')'],
            [8, ')0:1(']
        ]);
    }

    @test stringWithTrailingSpaces() {
        ParseTokens.check('"a b c  ', [[0, '"a b c  ']]);
    }

    @test namedArgs() {
        ParseTokens.check('x y swap = y x', [
            [0, 'x'],
            [2, 'y'],
            [4, 'swap'],
            [9, '='],
            [11, 'y'],
            [13, 'x']
        ]);
    }

}
