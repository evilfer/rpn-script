// @flow

import {TypeCheckContext} from '../base';
import type {ExprArityType} from './types';

export default class ExprTypeCheckContext extends TypeCheckContext {

    namespace: { [string]: ExprArityType };

    constructor(namespace: { [string]: ExprArityType } = {}) {
        super();
        this.namespace = namespace;
    }

}
