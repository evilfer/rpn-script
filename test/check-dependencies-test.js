import {expect} from 'chai';
import parseCode from "../src/parse-code";
import checkDependencies from "../src/check-dependencies";
import {UNKNOWN_VAR, CIRCULAR_DEP} from "../src/error-types";

describe('checkDependencies', () => {

    it('should identify dependencies', () => {
        let {namespace: {a, b}} = checkDependencies(parseCode("a=b\nb=1"));

        expect(a.dependencies).to.eql(['b']);
        expect(b.dependencies).to.eql([]);

        expect(a.errors).to.equal(false);
        expect(b.errors).to.equal(false);
    });

    it('should check for unknown var errors', () => {
        let {namespace: {a}} = checkDependencies(parseCode("a=b"));

        expect(a.dependencies).to.eql(['b']);

        expect(a.errors).to.eql([
            {type: UNKNOWN_VAR, name: 'b'}
        ]);
    });

    it('should check for circular dep var errors', () => {
        let {namespace: {a, b, c}} = checkDependencies(parseCode("a=b\nb=a\nc=1"));

        expect(a.dependencies).to.eql(['b']);

        expect(a.errors).to.eql([
            {type: CIRCULAR_DEP}
        ]);
        expect(b.errors).to.eql([
            {type: CIRCULAR_DEP}
        ]);
        expect(c.errors).to.eql(false);
    });

});


