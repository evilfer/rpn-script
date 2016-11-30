import {expect} from 'chai';
import splitTokens from "../src/maths/split-tokens";

describe('splitTokens', () => {

    const pairs = {
        '': [],
        ' ': [],
        '12': ['12'],
        '12 ': ['12'],
        '=': ['='],
        'a = 1': ['a', '=', '1'],
        '  a   =   1  ': ['a', '=', '1'],
        '(a)': ['(', 'a', ')'],
        '(a (b))': ['(', 'a', '(', 'b', ')', ')']
    };

    Object.keys(pairs).forEach(code => {
        it(`should split "${code}"`, () => {
            expect(splitTokens(code)).to.deep.eql(pairs[code]);
        });
    });
});


