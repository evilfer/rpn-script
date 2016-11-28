import {expect} from 'chai';
import parseCode from "../src/maths/parse-code";
import checkDependencies from "../src/maths/check-dependencies";
import {UNKNOWN_VAR, CIRCULAR_DEP, DEPENDENCY_ERROR} from "../src/maths/error-types";

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

    it('should order named and unnamed expressions', () => {
        let {ordered: [b, a, c]} = checkDependencies(parseCode("1\na=b\nb=2"));

        expect(b.name).to.eql('b');
        expect(a.name).to.eql('a');
        expect(c.name).to.be.null;
    });

    it('should check for dependent expressions errors', () => {
        let {ordered: [nm, un]} = checkDependencies(parseCode("a\na=c"));

        expect(nm.errors).to.eql([{type: UNKNOWN_VAR, name: 'c'}]);
        expect(un.errors).to.eql([{type: DEPENDENCY_ERROR, name: 'a'}]);
    });

});


