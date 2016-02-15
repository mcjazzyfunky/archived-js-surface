'use strict';

import ComponentMgr from './ComponentMgr.js';
import ComponentHelper from '../helpers/ComponentHelper.js';

const dummyObject = {};

export default {
    createFactory(config) {
        const configError = ComponentHelper.checkComponentFactoryConfig(config);
        
        if (configError) {
            throw new TypeError(
                    '[Component.createFactory] '
                    + configError.message);
        } 
        
        const ret = (initialProps, children) => (initialProps === dummyObject)
                ? dummyObject
                : {
                    isBlingComponent: true,
                    typeId: config.typeId,
                    initialProps,
                    children: children || null
                };
    
        ret.getConfig = () => config;
        return ret;
    },

    isFactory(componentFactory) {
        return typeof componentFactory === 'function'
                && typeof componentFactory.getConfig === 'function'
                && componentFactory(dummyObject) === dummyObject;
    },
    
    mount(mainComponent, targetNode, adapterId, componentMgr = ComponentMgr.getGlobal()) {
        let mountNode = null;
        
        if (typeof targetNode === 'string') {
            mountNode = document.getElementById(targetNode);
        } else if (targetNode
                && targetNode.firstChild !== undefined
                && typeof targetNode.appendChild === 'function'
                && typeof targetNode.removeChild === 'function') {
            while (targetNode.firstChild) {
                targetNode.removeChild(targetNode.firstChild);
            }
            
            mountNode = targetNode; 
        }
       
        if (mountNode) {
            const componentAdapter  = componentMgr.getAdapter(adapterId);
            
            // TODO - UGLY!!!
            componentAdapter.mount(componentAdapter.convertComponent(mainComponent), mountNode);
        }       
    }
};
