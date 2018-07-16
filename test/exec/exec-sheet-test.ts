import {execSheetTest} from "./utils";

describe("sheet exec", () => {
    it("should provide number literal type", () => {
        execSheetTest(`
            a = 1
            b = a
            `, {}, {
            a: [1],
            b: [1],
        });
    });
});
