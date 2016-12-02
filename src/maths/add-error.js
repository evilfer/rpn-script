export function addError(errors, error) {
    let errorObj = typeof error === 'string' ? {type: error} : error;
    if (!errors) {
        return [errorObj];
    }

    errors.push(errorObj);
    return errors;
}

export function addErrorContainer(container, error) {
    container.errors = addError(container.errors, error);
}
