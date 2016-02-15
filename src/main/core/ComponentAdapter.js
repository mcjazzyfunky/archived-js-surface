'use strict';

import ComponentMgr from '../core/ComponentMgr.js';
import ReactDOM from 'react-dom';

export default class ComponentAdapter {
    constructor(id) {
        const idRegex = /^[A-Z][a-zA-Z0-9]*$/;
        
        if (typeof id !== 'string' && !id.matches(idRegex)) {
            throw new TypeError(
                '[ComponentAdapter.constructor] '
                + 'First argument must be a proper adapter id matching the regex '
                + idRegex);
        }
        
        this.__id = id;
    }
    
    getId() {
        return this.__id;
    }

    createElement(tagName, props, children) {
        throw new Error(
            '[ComponentAdapter:createElement] '
            + 'Method not implemented/overridden');
    }

    convertComponent(component, componentMgr = ComponentMgr.getGlobal()) {
        throw new Error(
            '[ComponentAdapter:convertComponent] '
            + 'Method not implemented/overridden');        
    }
    
    mount(mainComponent, targetNode, componentMgr = ComponentMgr.getGlobal()) {
        throw new Error(
            '[ComponentAdapter:mount] '
            + 'Method not implemented/overridden');        
    }
}
