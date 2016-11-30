
export default function splitTokens(code) {
    let tokens = [];

    let regex = /\s+|(\)\()\s*|([()])\s*|([^\s()]+)\s*/g;
    let match;

    while (match = regex.exec(code)) {
        let token = match[1] || match[2]|| match[3];
        if (token) {
            tokens.push(token);
        }
    }

    return tokens;
}