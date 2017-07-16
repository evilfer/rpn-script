import {expect} from "chai";
import {Stack, StackValue} from "../../src/model/exec/stack";
import {ExecNamespace} from "../../src/model/exec/namespace";
import {Expression} from "../../src/model/expression";


function deVal(item: StackValue): any {
    let extracted = item.val;
    if (extracted.constructor === Array) {
        extracted = (<Array<StackValue>>extracted).map(deVal);
    }

    return extracted;
}

export function execTest(code: string, namespace: ExecNamespace, expected: any[]) {
    let e = new Expression(code);
    let result = e.exec(namespace);

    expect(result.map(deVal)).to.deep.eq(expected);
}

export function popTwo(stack: Stack): any[] {
    let b = stack.pop();
    let a = stack.pop();
    return [a && a.val, b && b.val];
}
