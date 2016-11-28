import parseCode from "./parse-code";
import checkDependencies from "./check-dependencies";
import identifyTypes from "./identify-types";
import reduce from "./reduce";

export default (code, namespace) => reduce(identifyTypes(checkDependencies(parseCode(code, namespace))))
