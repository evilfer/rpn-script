import extend from "extend";

export default function merge() {
    return extend({}, ...arguments);
}