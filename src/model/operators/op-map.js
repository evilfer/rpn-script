// @flow

import {MultipleTokenOperator, SingleTokenOperator} from './operator';

import {ArrayOperator, TupleOperator} from './comma-sep';
import {BooleanOperator, StringOperator, NumberOperator} from './literal';
import {ArgOperator} from './arg';
import {RefOperator} from './ref';
import {WrappedOperator} from './wrap';
import {UnwrapOperator} from './unwrap';

export const MULTIPLE_OPTS = {
    'wrapOpen': WrappedOperator,
    'arrayOpen': ArrayOperator,
    'tupleOpen': TupleOperator
};

export const SINGLE_OPTS = {
    'unwrap': UnwrapOperator,
    'number': NumberOperator,
    'string': StringOperator,
    'boolean': BooleanOperator,
    'ref': RefOperator,
    'arg': ArgOperator
};
