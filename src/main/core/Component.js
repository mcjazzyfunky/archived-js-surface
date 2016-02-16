'use strict';

import ComponentMgr from './ComponentMgr.js';
import ComponentHelper from '../helpers/ComponentHelper.js';

export default {
    createFactory(config) {
        const configError = ComponentHelper.checkComponentFactoryConfig(config);
        
        if (configError) {
            throw new TypeError(
                    '[Component.createFactory] '
                    + configError.message);
        } 
        
        const ret = (initialProps, ...children) => {
            const virtualNode = [
                `component:${config.typeId}`,
                initialProps,
                ... children
            ];
            
            virtualNode.__componentFactory = ret;
            return virtualNode;
        };

        ret.getConfig = () => config;
        return ret;
    },

    isFactory(componentFactory) {
        return typeof componentFactory === 'function'
                && typeof componentFactory.getConfig === 'function';
    },
    
    mount(content, targetNode, adapterId, componentMgr = ComponentMgr.getGlobal()) {
        let mountNode = null;
        
        if (!(componentMgr instanceof ComponentMgr)) {
            throw new TypeError(
                    '[Component:mount] '
                    + ' Fourth argument must be a componentMgr'); 
        } else if (typeof targetNode === 'string') {
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
            componentAdapter.mount(
                    componentAdapter.convertElement(content, componentMgr),
                    mountNode,
                    componentMgr);
        }       
    }
};
