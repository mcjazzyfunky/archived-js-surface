'use strict';

export default class Content {
    constructor(object) {
        if (object === null || typeof element !== 'object') {
            throw new TypeError('[Node.constructor] '
                + "First argument 'object' must be an object")
        }
        
        this.__object = object;
    }
   
    get object() {
        return this.__element; 
    }
}
