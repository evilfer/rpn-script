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

export function wrappedType({argIn = [], argOut = []} = {}) {
    return {
        type: 'wrapped',
        argIn,
        argOut
    };
}

export function typeMatch(typeA, typeB) {
    if (!typeA || !typeB || !isDescendent(typeB.type, typeA.type)) {
        return false;
    }

    typeA.type = typeB.type;
    return true;
}
