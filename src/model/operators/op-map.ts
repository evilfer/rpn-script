import {ArrayOperator, TupleOperator} from './comma-sep';
import {BooleanOperator, StringOperator, NumberOperator} from './literal';
import {ArgOperator} from './arg';
import {RefOperator} from './ref';
import {WrappedOperator} from './wrap';
import {UnwrapOperator} from './unwrap';
import {MultipleTokenOperator, SingleTokenOperator} from "./operator";
import {CodeToken} from "../code-token";
import {OperatorListType} from "../base";

export const MULTIPLE_OPTS: { [key: string]: { (tokens: CodeToken[], items: OperatorListType[]): MultipleTokenOperator } } = {
    'wrapOpen': (tokens, items) => new WrappedOperator(tokens, items),
    'arrayOpen': (tokens, items) => new ArrayOperator(tokens, items),
    'tupleOpen': (tokens, items) => new TupleOperator(tokens, items)
};

export const SINGLE_OPTS: { [key: string]: { (token: CodeToken): SingleTokenOperator } } = {
    'unwrap': token => new UnwrapOperator(token),
    'number': token => new NumberOperator(token),
    'string': token => new StringOperator(token),
    'boolean': token => new BooleanOperator(token),
    'ref': token => new RefOperator(token),
    'arg': token => new ArgOperator(token)
};
