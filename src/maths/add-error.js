export function addError(errors, error) {
    if (!errors) {
        return [error];
    }

    errors.push(error);
    return errors;
}

export function addErrorContainer(container, errors) {
    container.errors = addError(container.errors, errors);
}
