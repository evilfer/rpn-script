
export default function splitTokens(code) {
    let tokens = [];

    let regex = /\s+|(\)([0-9]+:[0-9]+)?\()\s*|([()[\],])\s*|([^\s()[\],]+)\s*/g;
    let match;

    while (match = regex.exec(code)) {
        let token = match[1] || match[3] || match[4];
        if (token) {
            tokens.push(token);
        }
    }

    return tokens;
}