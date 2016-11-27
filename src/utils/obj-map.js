export default function objMap(obj, tx) {
    return Object.keys(obj).reduce((acc, key) => {
        acc[key] = tx(obj[key], key, obj);
        return acc;
    }, {});
}