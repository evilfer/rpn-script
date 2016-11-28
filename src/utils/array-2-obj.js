export default function array2object(array, tx) {
    return array.reduce((acc, item, i, array) => {
        let pair = tx(item, i, array, acc);
        if (pair) {
            let [key, value] = pair;
            acc[key] = value;
        }
        return acc;
    }, {});
}
