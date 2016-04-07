'use strict';

export default class Content {
    constructor(node) {
        if (node === null || typeof node !== 'object') {
            throw new TypeError('[Node.constructor] '
                + "First argument 'object' must be an object")
        }
        
        this.__node = node;
    }
   
    get node() {
        return this.__node; 
    }
}
