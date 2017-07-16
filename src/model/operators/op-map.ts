import {CodeToken} from "../code-token";
import {ArgOperator} from "./arg/arg";
import {ArrayOperator} from "./array";
import {BooleanOperator} from "./literal/boolean";
import {NumberOperator} from "./literal/number";
import {StringOperator} from "./literal/string";
import {MultipleTokenOperator} from "./multiple-token-operator";
import {OperatorList} from "./operator";
import {RefOperator} from "./ref";
import {SingleTokenOperator} from "./single-token-operator";
import {TupleOperator} from "./tuple";
import {UnwrapOperator} from "./unwrap";
import {WrappedOperator} from "./wrap";

export const MULTIPLE_OPTS: { [key: string]: (tokens: CodeToken[], items: OperatorList[]) => MultipleTokenOperator } = {
    arrayOpen: (tokens, items) => new ArrayOperator(tokens, items),
    tupleOpen: (tokens, items) => new TupleOperator(tokens, items),
    wrapOpen: (tokens, items) => new WrappedOperator(tokens, items),
};

export const SINGLE_OPTS: { [key: string]: (token: CodeToken) => SingleTokenOperator } = {
    arg: token => new ArgOperator(token),
    boolean: token => new BooleanOperator(token),
    number: token => new NumberOperator(token),
    ref: token => new RefOperator(token),
    string: token => new StringOperator(token),
    unwrap: token => new UnwrapOperator(token),
};
