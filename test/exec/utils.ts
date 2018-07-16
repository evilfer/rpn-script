import {expect} from "chai";
import {ExecNamespace} from "../../src/model/exec/namespace";
import {Stack, StackValue} from "../../src/model/exec/stack";
import {Expression} from "../../src/model/expression";
import {Sheet} from "../../src/model/sheet";

function deVal(item: StackValue): any {
    let extracted = item.val;
    if (extracted.constructor === Array) {
        extracted = (extracted as StackValue[]).map(deVal);
    }

    return extracted;
}

export function execTest(code: string, namespace: ExecNamespace, expected: any[]) {
    const e = new Expression(code);
    const result = e.exec(namespace);

    expect(result.map(deVal)).to.deep.eq(expected);
}

export function execSheetTest(code: string, namespace: ExecNamespace, expected: { [name: string]: any[] }) {
    const sheet = new Sheet(code);
    sheet.exec(namespace);

    const result = Object.keys(sheet.exprNameMap)
        .reduce((acc, key) => {
            acc[key] = sheet.exprNameMap[key].result!.map(deVal);
            return acc;
        }, {} as { [name: string]: any[] });

    expect(result).to.deep.eq(expected);
}

export function popTwo(stack: Stack): any[] {
    const b = stack.pop();
    const a = stack.pop();
    return [a && a.val, b && b.val];
}
