import parseCode from "./parse-code";
import checkDependencies from "./check-dependencies";
import evaluate from "./evaluate";

export default (code, namespace) => evaluate(checkDependencies(parseCode(code, namespace)))
