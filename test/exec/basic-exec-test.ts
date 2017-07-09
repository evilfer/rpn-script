import {expect} from 'chai';
import {Expression} from '../../src/model/expression';
import debugOpType2string from "../../src/model/operands/debug-operation-type-to-string";
import {ExecNamespace} from "../../src/model/exec/namespace";
import {Stack, StackValue} from "../../src/model/exec/stack";

function deVal(item: StackValue): any {
    let extracted = item.val;
    if (extracted.constructor === Array) {
        extracted = (<Array<StackValue>>extracted).map(deVal);
    }

    return extracted;
}
function test(code: string, namespace: ExecNamespace, expected: any[]) {
    let e = new Expression(code);
    let result = e.exec(namespace);

    expect(result.map(deVal)).to.deep.eq(expected);
}


describe('basic operator exec', () => {
    describe('literal types', () => {

        it('should provide number literal type', () => {
            test('1 2.5', {}, [
                1,
                2.5
            ]);
        });

        it('should provide string literal type', () => {
            test('"a" "3"', {}, [
                'a',
                '3'
            ]);
        });

        it('should provide boolean literal type', () => {
            test('true false', {}, [
                true,
                false
            ]);
        });
    });

    describe('arrays', () => {
        it('should provide untyped array', () => {
            test('[]', {}, [
                []
            ]);
        });

        it('should provide literal type array', () => {
            test('[1]', {}, [
                [1]
            ]);
        });

        it('should provide multiple literal type array', () => {
            test('["1", "2"]', {}, [
                ['1', '2']
            ]);
        });

        it('should handle nested arrays', () => {
            test('[[]]', {}, [
                [[]]
            ]);
        });
    });

    describe('tuples', () => {
        it('should provide empty tuple', () => {
            test('()', {}, [
                []
            ]);
        });

        it('should provide literal tuple', () => {
            test('(1, "1")', {}, [
                [1, '1']
            ]);
        });
    });
    /*
     describe('wrapped', () => {
     it('should provide empty wrapped operators', () => {
     let e = new Expression('{}');
     let type = e.getType({});

     expect(type).to.deep.eq({
     input: [],
     output: [0],
     types: {
     0: {
     type: 'wrapped',
     wrapped: {
     input: [],
     output: []
     }
     }
     }
     });
     expect(debugOpType2string(type)).to.equal('{}');
     });

     it('should provide literal wrapped operators', () => {
     let e = new Expression('{1}');
     let type = e.getType({});

     expect(type).to.deep.eq({
     input: [],
     output: [1],
     types: {
     0: {
     type: 'number'
     },
     1: {
     type: 'wrapped',
     wrapped: {
     input: [],
     output: [0]
     }
     }
     }
     });
     expect(debugOpType2string(type)).to.equal('{number}');
     });
     });*/

});
