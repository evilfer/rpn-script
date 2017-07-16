import {OperandType, OperationType, TypeArity} from "./operand-types";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function idOf(i: number): string {
    return (i >= LETTERS.length ? idOf(Math.floor(i / LETTERS.length)) : "") + LETTERS[i % LETTERS.length];
}

function arityIsUndefined(types: { [id: number]: OperandType }, arity: TypeArity): boolean {
    return arity.input.some(id => isUndefined(types, id)) ||
        arity.output.some(id => isUndefined(types, id));
}

function isUndefined(types: { [id: number]: OperandType }, id: number): boolean {
    const ot: OperandType = types[id];
    switch (ot.type) {
        case null:
            return true;
        case "array":
            return isUndefined(types, ot.array || 0);
        case "tuple":
            return !ot.tuple || ot.tuple.some(a => isUndefined(types, a));
        case "wrapped":
            return !ot.wrapped || arityIsUndefined(types, ot.wrapped);
        default:
            return false;
    }
}

function typeName(types: { [id: number]: OperandType }, nameMap: { [id: number]: string }, id: number): null | string {
    if (typeof nameMap[id] === "string") {
        return nameMap[id];
    }

    if (isUndefined(types, id)) {
        const name = idOf(Object.keys(nameMap).length);
        nameMap[id] = name;
        return name;
    }

    return null;
}

function typeStr(types: { [id: number]: OperandType }, nameMap: { [id: number]: string }, id: number): string {
    const ot: OperandType = types[id];
    switch (ot.type) {
        case null:
            return "?";
        case "array": {
            const innerType = type2string(types, nameMap, ot.array || 0);
            return `[${innerType}]`;
        }
        case "tuple": {
            const innerTypes = ot.tuple ? ot.tuple.map(a => type2string(types, nameMap, a)).join(", ") : "-";
            return `(${innerTypes})`;
        }
        case "wrapped": {
            const innerType = ot.wrapped ? arity2string(types, nameMap, ot.wrapped) : "-";
            return `{${innerType}}`;
        }
        default:
            return ot.type;
    }
}

function type2string(types: { [id: number]: OperandType }, nameMap: { [id: number]: string }, id: number) {
    const name = typeName(types, nameMap, id);
    const str = typeStr(types, nameMap, id);
    return name ? `${name}:${str}` : str;
}

function list2string(types: { [id: number]: OperandType }, nameMap: { [id: number]: string }, list: number[]): string {
    return list.map(type => type2string(types, nameMap, type)).join(" ");
}

function arity2string(types: { [id: number]: OperandType },
                      nameMap: { [id: number]: string },
                      arity: TypeArity): string {
    const input = list2string(types, nameMap, arity.input);
    const output = list2string(types, nameMap, arity.output);

    if (input.length > 0) {
        return `${input} -> ${output}`;
    } else {
        return output;
    }
}

export default function debugOpType2string(type: OperationType): string {
    const nameMap: { [id: number]: string } = {};

    return arity2string(type.types, nameMap, type);
}
