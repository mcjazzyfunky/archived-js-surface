'use strict';

import ComponentAdapter from 'js-bling-adapter';
import {Subject} from 'rxjs';

try {
    if (!ComponentAdapter || typeof ComponentAdapter !== 'object') {
        throw new TypeError("The imported module for 'js-bling-adapter' did not return a proper ComponentAdapter");
    } else if (typeof ComponentAdapter.createElement !== 'function') {
        throw new TypeError("The component adapter of module 'js-bling-adapter' does not provide a 'createElement' function");
    } else if (typeof ComponentAdapter.convertComponentFactory !== 'function') {
        throw new TypeError("The component adapter of module 'js-bling-adapter' does not provide a 'createComponentFactory' function");
    } else if (typeof ComponentAdapter.mount !== 'function') {
        throw new TypeError("The component adapter of module 'js-bling-adapter' does not provide a 'mount' function");
    }
} catch (e) {
    console.error('[Component.js] Invalid component adapter (please check your module configuration):', ComponentAdapter);
    throw new TypeError('[Component.js] ' + e.message);
}

const Component = {
    createElement(tag, props, children) {
        if (tag === undefined || tag === null) {
            throw new TypeError("[Component.createElement] First argument 'tag' must not be empty");    
        }

        

        return ComponentAdapter.createElement(tag, props, children);    
    },
    
    createFactory(config) {
        const configError = checkComponentFactoryConfig(config);
        
        if (configError) {
            console.error('[Component.createFactory] Invalid configuration:', config);
            
            throw new TypeError(
                    '[Component.createFactory] '
                    + configError.message);
        } 
        
        var convertedFactory;
        
        const ret = (initialProps, ...children) => {
            return ComponentAdapter.createElement(convertedFactory, initialProps, children);
        };
   
        ret.meta = {
            config: Object.freeze(Object.assign({}, config)),
            convertedFactory: () => null, // will be updated below
            Component
        };
    
        convertedFactory = ComponentAdapter.convertComponentFactory(ret);
        
        ret.meta.convertedFactory = ret;
        Object.freeze(ret.meta);
        Object.freeze(ret);
        
        return ret;
    },

    isFactory(componentFactory) {
        return typeof componentFactory === 'function'
                && componentFactory.meta
                && componentFactory.meta.config
                && componentFactory.meta.convertedFactory
                && componentFactory.meta.Component === Component;
    },
    
    createEventBinder() {
        const subjectsByName = new Map();
    
        return {
            on(eventName) {
                let ret = subjectsByName.get(eventName);
                
                if (!ret) {
                    ret = new Subject(); 
                    subjectsByName.set(eventName, ret);
                }
                
                return ret.asObservable();
            }, 
            
            bind(eventName, mapper = null) {
                if (typeof eventName !== 'string') {
                    throw new Error('[ReactAdapter.js|createEventBinder] First argument must be a string');
                } else if (mapper !== null && typeof mapper !== 'function') {
                    throw new Error('[ReactAdapter.js|createEventBinder] Second argument must be a function or null');
                }
                        
                let subject = subjectsByName.get(eventName);
        
                if (!subject) {
                    subject = new Subject(); 
                    subjectsByName.set(eventName, subject);
                }
                
                const mapEvent = mapper
                        ? event => mapper(event)
                        : event => event;
                
                return event => subject.next(mapEvent(event));
            }
        };
    },
    
    isEventBinder(obj) {
        return obj && typeof obj.on === 'function' && typeof obj.bind === 'function';
    },
    
    mount(content, targetNode) {
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
            ComponentAdapter.mount(
                    content,
                    mountNode);
        }       
    }
};

export default Component;

function checkComponentFactoryConfig(config) {
    var ret;
    
    const typeIdRegex = /^[A-Z][a-zA-Z0-9]*$/;
    
    if (config === null || typeof config !== 'object') {
        ret = new TypeError('Component configuration has to of type {typeId : String, view: Function}');
    } else if (config.typeId === undefined  || config.typeId === null) {
        ret = new TypeError("Component configuration value 'typeId' is missing");
    } else if (typeof config.typeId !== 'string' || !config.typeId.match(typeIdRegex)) {
        ret = new TypeError(`Illegal value for 'typeID' (must match regex ${typeIdRegex})`);
    } else if (config.view === undefined || config.view === null) {
        ret = new TypeError("Component configuration value 'view' is missing");
    } else if (typeof config.view !== 'function') {
        ret = new TypeError("Component configuration value 'view' has to be a function");
    } else {
        ret = null;
    }
    
    return ret;
}