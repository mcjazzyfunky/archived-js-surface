'use strict';

import ComponentAdapter from 'js-bling-adapter';
import {Subject} from 'rxjs';
import {Objects} from 'js-prelude';

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
    createElement(tag, props, ...children) {
        if (tag === undefined || tag === null) {
            throw new TypeError("[Component.createElement] First argument 'tag' must not be empty");    
        }

        return (Component.isFactory(tag))
                ? tag.meta.convertedFactory(props, children)
                : ComponentAdapter.createElement(tag, props, children);    
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
            return convertedFactory(initialProps, children);
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
        const
            subject = new Subject(),
            
            observable = subject.toObservable(),
            
            ret = mapper => event => {
                if (!mapper) {
                    subject.next(event);
                } else {
                    subject.next(mapper(event));
                }
            };
            
        ret.toObservable = () => observable;
        
        return ret;
    },
    
    
    createEventBinders(...names) {
        const ret = {};
        
        for (let name of names) {
            if ()
            ret[name] = Component.createEventBinder();
        }
        
        return ret;
    }
    
    createEventBinder2() {
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
                    console.error("[<event-binder>.bind] Invalid first argument 'eventName':, eventName");
                    throw new Error('[<event-binder>.bind] First argument must be a string');
                } else if (mapper !== null && typeof mapper !== 'function') {
                    console.error("[<event-binder>.bind] Invalid second argument 'mapper':", mapper);
                    throw new Error('[<event-binder>.bind] Second argument must be a function or null');
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
            
            mountNode = targetNode; 
        }
        
        if (!mountNode) {
            console.error('[Component.mount] Invalid target node for mounting:', targetNode);

            throw new Error('[Component.mount] Invalid target node'
                  + (targetNode !== 'string' ? '' : ` '${targetNode}'`));
        }
        
        while (mountNode.firstChild) {
            mountNode.removeChild(mountNode.firstChild);
        }

        ComponentAdapter.mount(
            content,
            mountNode);
    }
};

export default Component;

function checkComponentFactoryConfig(config) {
    var ret;
    
    const
        typeIdRegex = /^[A-Z][a-zA-Z0-9]*$/,
        hasConfig = typeof config === 'object' && config !== null,
        hasTypeIdProp = hasConfig && Objects.isSomething(config.typeId),
        hasUIProp = hasConfig && Objects.isSomething(config.ui),
        hasViewProp = hasConfig && Objects.isSomething(config.view),
        hasIntendProp = hasConfig && Objects.isSomething(config.intend),
        hasModelProp = hasConfig && Objects.isSomething(config.model),
        hasContextProp = hasConfig && Objects.isSomething(config.context),
        hasEventsProp = hasConfig && Objects.isSomething(config.events),
        hasBroadcastsProp = hasConfig && Objects.isSomething(config.broadcasts);

    if (!hasConfig) {
        ret = new TypeError('Component configuration must be an object');
    } else if (!hasTypeIdProp) {
        ret = new TypeError("Component configuration value 'typeId' is missing");
    } else if (typeof config.typeId !== 'string' || !config.typeId.match(typeIdRegex)) {
        ret = new TypeError(`Illegal value for 'typeId' (must match regex ${typeIdRegex})`);
    } else if (!hasUIProp && !hasViewProp) {
        ret = new TypeError("Component configuration must either provide a 'ui' method or a 'view' method");
    } else if (hasUIProp && typeof config.ui !== 'function') {
        ret = new TypeError("Component configuration value 'ui' has to be a function");
    } else if (hasUIProp && (hasIntendProp || hasModelProp || hasEventsProp || hasBroadcastsProp)) {
        ret = new TypeError("If component configuration value 'ui' is set, then "
                + 'the following configuration properties are not allowed: '
                + "'view', 'intend', 'model', 'events', 'broadcasts'");
    } else if (hasViewProp && typeof config.view !== 'function') {
        ret = new TypeError("Component configuration value 'view' has to be a function");
    } else if (hasIntendProp && typeof config.intend !== 'function') {
        ret = new TypeError("Optional component configuration value 'intend' has to be a function");
    } else if (hasModelProp && typeof config.model !== 'function') {
        ret = new TypeError("Optional component configuration value 'model' has to be a function");
    } else if (hasContextProp && typeof config.context !== 'function') {
        ret = new TypeError("Optional component configuration value 'context' has to be a function");
    } else if (hasEventsProp && typeof config.events !== 'function') {
        ret = new TypeError("Optional component configuration value 'events' has to be a function");
    } else if (hasBroadcastsProp && typeof config.broadcasts !== 'function') {
        ret = new TypeError("Optional component configuration value 'broadcasts' has to be a function");
    } else {
        ret = null;
    }
    
    return ret;
}