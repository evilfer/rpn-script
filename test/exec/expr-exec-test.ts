import {expect} from "chai";
import {Expression} from '../../src/model/expression';
import debugOpType2string from "../../src/model/operands/debug-operation-type-to-string";
import {ExecNamespace} from "../../src/model/exec/namespace";
import {Stack} from "../../src/model/exec/stack";
import {execTest} from './utils';
import {RefOperator} from "../../src/model/operators/ref";

function popTwo(stack: Stack): any[] {
    let b = stack.pop();
    let a = stack.pop();
    return [a && a.val, b && b.val];
}

describe('expression ref operator types', () => {
    let namespace: ExecNamespace;

    beforeEach(() => {
        namespace = {
            's': {
                applyTo: (stack: Stack, namespace: ExecNamespace) => {
                    stack.push({val: 'hi world'});
                }
            },
            'n': {
                applyTo: (stack: Stack, namespace: ExecNamespace) => {
                    stack.push({val: 3.14});
                }
            },
            'add': {
                applyTo: (stack: Stack, namespace: ExecNamespace) => {
                    let [a, b] = popTwo(stack);
                    stack.push({val: a + b});
                }
            },
            'subtract': {
                applyTo: (stack: Stack, namespace: ExecNamespace) => {
                    let [a, b] = popTwo(stack);
                    stack.push({val: a - b});
                }
            },
            'concat': {
                applyTo: (stack: Stack, namespace: ExecNamespace) => {
                    let [a, b] = popTwo(stack);
                    stack.push({val: a + b});
                }
            },
            'switch': {
                applyTo: (stack: Stack, namespace: ExecNamespace) => {
                    let [a, b] = popTwo(stack);
                    stack.push({val: b});
                    stack.push({val: a});
                }
            },
            'arr_get': {
                applyTo: (stack: Stack, namespace: ExecNamespace) => {
                    let [a, b] = popTwo(stack);
                    stack.push({val: a[b]});
                }
            }
        };
    });

    describe('literal types', () => {
        it('should apply literal expr', () => {
            execTest('s', namespace, [
                'hi world'
            ]);
        });

        it('should apply multiple expr', () => {
            execTest('s n', namespace, [
                'hi world',
                3.14
            ]);
        });

        it('should use expressions in arrays', () => {
            execTest('[s]', namespace, [
                ['hi world']
            ]);
        });

        it('should use expressions in wraps', () => {
            let e = new Expression('{s n}');
            let result = e.exec(namespace);
            let [wrapped] = result;
            let [o1, o2] = <any[]> wrapped.val;
            expect(o1.constructor).to.equal(RefOperator);
            expect(o1.ref).to.equal('s');
            expect(o2.constructor).to.equal(RefOperator);
            expect(o2.ref).to.equal('n');
        });

        it('should use expressions in tuples', () => {
            execTest('(n, s, n)', namespace, [
                [3.14, 'hi world', 3.14]
            ]);
        });
    });

    describe('function types', () => {
        it('should apply function expr', () => {
            execTest('1 2 add', namespace, [
                3
            ]);
        });
        it('should combine function expr', () => {
            execTest('1 2 3 add add', namespace, [
                6
            ]);
        });

        it('should get params in right order', () => {
            execTest('1 2 subtract', namespace, [
                -1
            ]);
        });

        it('should combine ops correctly', () => {
            execTest('1 2 switch subtract', namespace, [
                1
            ]);
        });
    });
});
