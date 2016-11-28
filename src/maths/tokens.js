export default function tokens(str) {
    return str.split(" ").map(t => t.trim()).filter(t => t.length > 0);
}