import {expect} from 'chai';
import parseCode from "../src/parse-code";
import {REDEFINE_VAR} from "../src/error-types";


describe('parseCode', () => {

    it('should identify empty lines', () => {
        let {lines, unnamed, ordered, namespace} = parseCode('\n', {});

        expect(lines.length).to.equal(2);
        expect(lines[0].expr).to.be.null;
        expect(lines[1].expr).to.be.null;
        expect(unnamed).to.deep.eql([]);
        expect(ordered).to.deep.eql([]);
        expect(namespace).to.deep.eql({});
    });

    it('should identify expressions without name', () => {
        let {lines, unnamed, ordered, namespace} = parseCode('\n1', {});

        expect(lines.length).to.equal(2);
        expect(lines[1].expr).to.be.an('object');

        expect(unnamed.length).to.equal(1);
        expect(unnamed[0]).to.be.an('object');
    });

    it('should identify named expressions', () => {
        let {lines, named, unnamed, ordered, namespace} = parseCode('\na = 1', {});

        expect(lines.length).to.equal(2);
        expect(lines[1].expr).to.be.an('object');

        expect(named.length).to.equal(1);
        expect(named[0]).to.be.an('object');

        expect(unnamed.length).to.equal(0);
        expect(namespace["a"]).to.equal(named[0]);

        expect(ordered.length).to.equal(0);
    });


    it('should check for repeated named expressions', () => {
        let {lines: [a1, a2]} = parseCode("a = 1\na = 2");

        expect(a1.expr.errors).to.equal(false);
        expect(a2.expr.errors).to.eql([{type: REDEFINE_VAR}]);
    });

    it('should list all expressions', () => {
        let {lines, all} = parseCode('a = 1\n2', {});

        expect(lines.length).to.equal(2);
        expect(lines[0].expr).to.be.an('object');
        expect(lines[1].expr).to.be.an('object');

        expect(all.length).to.equal(2);
    });
});

