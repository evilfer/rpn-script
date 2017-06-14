import {expect} from 'chai';
import {Expression} from '../../src/model/expression';
import debugTypesToString from '../../src/model/operands/debugTypesToString';


describe('type checking', () => {

    const tests = {
        '1': 'number',
        '"a"': 'string',
        '[1]': '[number]'
    };


    Object.keys(tests).forEach(test => {
        it(`should compute types of "${test}"`, () => {
            let e = new Expression(test);
            let context = e.runTypeCheck();
            let output = debugTypesToString(context);

            expect(output).to.equal(tests[test]);
        });
    });
});
