const TYPE_PARENT = {
    'number': 'any'
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

export function typeMatch(typeA, typeB) {
    if (!typeA || !typeB || !isDescendent(typeB.type, typeA.type)) {
        return false;
    }

    typeA.type = typeB.type;
    return true;
}
