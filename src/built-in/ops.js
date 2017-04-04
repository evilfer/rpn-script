import extend from "extend";

import numberOps from "./number-ops";
import arrayOps from "./array-ops";

export default extend({}, numberOps, arrayOps);