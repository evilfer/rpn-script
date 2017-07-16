import {expect} from "chai";
import {resolveDependencies} from "../../src/deps/dependency-manager";

describe("dependency-manager", () => {

    it("should return empty list for empty input", () => {
        expect(resolveDependencies([])).to.deep.eq({
            circular: [],
            ordered: [],
        });
    });

    it("should return name for single item", () => {
        expect(resolveDependencies([{name: "a", dependencies: []}])).to.deep.eq({
            circular: [],
            ordered: ["a"],
        });
    });

    it("should solve direct dependencies", () => {
        expect(resolveDependencies([
            {name: "a", dependencies: ["b"]},
            {name: "b", dependencies: []},
        ])).to.deep.eq({
            circular: [],
            ordered: ["b", "a"],
        });
    });

    it("should solve indirect dependencies", () => {
        expect(resolveDependencies([
            {name: "a", dependencies: ["b"]},
            {name: "b", dependencies: ["c"]},
            {name: "c", dependencies: []},
        ])).to.deep.eq({
            circular: [],
            ordered: ["c", "b", "a"],
        });
    });

    it("should identify circular dependencies", () => {
        expect(resolveDependencies([
            {name: "a", dependencies: ["b"]},
            {name: "b", dependencies: ["c"]},
            {name: "c", dependencies: ["b"]},
        ])).to.deep.eq({
            circular: ["c", "b"],
            ordered: ["a"],
        });
    });
});
