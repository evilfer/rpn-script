import {createArrayFromRhs, createArrayItemFromRhs, applyRhs} from "../evaluate";
import {typeArray} from "../stack-types";

export default {
    range: {
        name: 'range',
        tx: (args, expr, scope) => {
            let [n] = args;
            if (typeof n.value === 'number') {
                let rhsList = Array.from(new Array(n.value).keys()).map(value => [{type: 'number', value}]);
                return [createArrayFromRhs(scope, rhsList)];
            } else {
                return [{type: 'array'}];
            }
        },
        input: [{type: 'number'}],
        output: [{type: 'array'}],
        native: true
    },
    map: {
        name: 'map',
        tx: (args, expr, scope) => {
            let [array, fn] = args;
            if (array.value && fn.value) {
                array.value.forEach(({evaluation}) => {
                    applyRhs(scope, fn.value, evaluation);
                });
                return [array];
            } else {
                return [{type: 'array'}];
            }
        },
        input: [{type: 'array'}, {type: 'wrapped'}],
        output: [{type: 'array'}],
        native: true
    },

    zip: {
        name: 'zip',
        tx: (args, expr, scope) => {
            let i1 = args[0].value;
            let i2 = args[1].value;
            if (i1 && i2) {
                let n = Math.min(i1.length, i2.length);
                let value = [];
                for (let i = 0; i < n; i++) {
                    value.push(createArrayItemFromRhs(scope, [...i1[i].rhs, ...i2[i].rhs]));
                }

                return [typeArray(value)];
            } else {
                return [typeArray(null)];
            }
        },
        input: [typeArray(), typeArray()],
        output: [typeArray()],
        native: true
    }
};
