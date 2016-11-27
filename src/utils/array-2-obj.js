export default function array2object(array, tx) {
    return array.reduce((acc, item, i, array) => {
        let [key, value] = tx(item, i, array);
        acc[key] = value;
        return acc;
    }, {});
}
