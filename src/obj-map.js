export function objMap(obj, tx) {
    return Object.keys(obj).reduce((acc, key) => {
        acc[key] = tx(obj[key], key, obj);
        return acc;
    }, {});
}

export function array2obj(array, tx) {
    return array.reduce((acc, item, i, array) => {
        let pair = tx(item, i, array, acc);
        if (pair) {
            let [key, value] = pair;
            acc[key] = value;
        }
        return acc;
    }, {});
}