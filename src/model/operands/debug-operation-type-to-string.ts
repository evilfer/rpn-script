import {OperationType, OperandType, TypeArity} from './operand-types';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function idOf(i: number): string {
    return (i >= LETTERS.length ? idOf(Math.floor(i / LETTERS.length)) : '') + LETTERS[i % LETTERS.length];
}

function arityIsUndefined(types: { [id: number]: OperandType }, arity: TypeArity): boolean {
    return arity.input.some(id => isUndefined(types, id)) ||
        arity.output.some(id => isUndefined(types, id));
}

function isUndefined(types: { [id: number]: OperandType }, id: number): boolean {
    let ot: OperandType = types[id];
    switch (ot.type) {
        case null:
            return true;
        case 'array':
            return !ot.array || arityIsUndefined(types, ot.array);
        case 'tuple':
            return !ot.tuple || ot.tuple.some(a => arityIsUndefined(types, a));
        case 'wrapped':
            return !ot.wrapped || arityIsUndefined(types, ot.wrapped);
        default:
            return false;
    }
}

function typeName(types: { [id: number]: OperandType }, nameMap: { [id: number]: string }, id: number): null | string {
    if (typeof nameMap[id] === 'string') {
        return nameMap[id];
    }

    if (isUndefined(types, id)) {
        let name = idOf(Object.keys(nameMap).length);
        nameMap[id] = name;
        return name;
    }

    return null;
}

function typeStr(types: { [id: number]: OperandType }, nameMap: { [id: number]: string }, id: number): string {
    let ot: OperandType = types[id];
    switch (ot.type) {
        case null:
            return '?';
        case 'array': {
            let innerType = ot.array ? arity2string(types, nameMap, ot.array) : '-';
            return `[${innerType}]`;
        }
        case 'tuple': {
            let innerTypes = ot.tuple ? ot.tuple.map(a => arity2string(types, nameMap, a)).join(', ') : '-';
            return `(${innerTypes})`;
        }
        case 'wrapped': {
            let innerType = ot.wrapped ? arity2string(types, nameMap, ot.wrapped) : '-';
            return `{${innerType}}`;
        }
        default:
            return ot.type;
    }
}

function list2string(types: { [id: number]: OperandType }, nameMap: { [id: number]: string }, list: number[]): string {
    return list.map(type => {
        let name = typeName(types, nameMap, type);
        let str = typeStr(types, nameMap, type);
        return name ? `${name}:${str}` : str;
    }).join(' ');
}

function arity2string(types: { [id: number]: OperandType }, nameMap: { [id: number]: string }, arity: TypeArity): string {
    let input = list2string(types, nameMap, arity.input);
    let output = list2string(types, nameMap, arity.output);

    if (input.length > 0) {
        return `${input} -> ${output}`;
    } else {
        return output;
    }
}

export default function debugOpType2string(type: OperationType): string {
    let nameMap: { [id: number]: string } = {};

    return arity2string(type.types, nameMap, type);
}
