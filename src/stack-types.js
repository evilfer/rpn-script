export function typeNumber(value = null) {
    return typed('number', value);
}

export function typeAny() {
    return typed('any');
}

export function typeWrapped(value = null) {
    return typed('wrapped', value);
}

export function typeArray(value = null) {
    return typed('array', value);
}

export function typed(type = 'any', value = null) {
    return {type, value};
}

export function typeRepeat(n, type = 'any') {
    return Array.from(new Array(n).keys()).map(() => typed(type));
}


const TYPES = {
    'number': {
        is: {'number': true, 'any': true},
        canBecome: {}
    },
    'wrapped': {
        is: {'wrapped': true, 'any': true},
        canBecome: {}
    },
    'array': {
        is: {'array': true, 'any': true},
        canBecome: {}
    },
    'any': {
        is: {'any': true},
        canBecome: {'wrapped': true, 'number': true, 'array': true}
    }
};

export function requestType(element, expected) {
    let current = element.type;

    if (TYPES[current].is[expected]) {
        return true;
    }

    if (element.value === null && TYPES[current].canBecome[expected]) {
        element.type = expected;
        return true;
    }

    return false;
}
