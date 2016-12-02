const TYPE_PARENT = {
    'number': 'any',
    'wrapped': 'any'
};

function isDescendent(typeA, typeB) {
    return typeA && typeB && (
            typeA === typeB || isDescendent(TYPE_PARENT[typeA], typeB)
        );
}

export function anyType() {
    return {type: 'any'};
}

export function numberType() {
    return {type: 'number'};
}

export function wrappedType(expr = null) {
    return {
        type: 'wrapped',
        expr
    };
}

export function typeMatch(typeA, typeB) {
    if (!typeA || !typeB || !isDescendent(typeB.type, typeA.type)) {
        return false;
    }

    typeA.type = typeB.type;
    return true;
}

export function isOfType({type}, expected) {
    return type === expected || TYPE_PARENT[type] === expected;
}
