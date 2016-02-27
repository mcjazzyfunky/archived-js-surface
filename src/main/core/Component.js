'use strict';

import ComponentAdapter from 'js-bling-adapter';
import {Observable, Subject} from 'rxjs';
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
            ui: config.ui ? config.ui : buildUIFunction(config),
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
        return new EventBinder();
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

class EventBinder {
    constructor() {
        this.__subject = new Subject();
        this.__observable = this.__subject.asObservable();
    }
    
    bind(mapper = e => e) {
        if (typeof mapper !== 'function') {
            throw new TypeError("[EventBinder:bind] First argument 'mapper' must be a function");
        }
        
        return e => this.__subject.next(mapper(e));
    }
    
    asObservable() {
        return this.__observable;
    }
}


function buildUIFunction(config) {
    return (behavior, dependencies) => {
        const
            hasIntentCfg = !!config.intent,
            hasModelCfg = !!config.model,
            hasEventsCfg = !!config.events,
            hasBroadcastsCfg = !!config.broadcasts,
            
            modelSbj = new Subject(),
            context = config.context ? config.context(dependencies) : dependencies,
            viewResult = config.view(behavior, modelSbj.asObservable(), context);
        
        let ret;
        
        if (viewResult instanceof Observable) {
            ret = {display: viewResult, events: null, broadcasts: null};
        } else if (viewResult === null) {
            throw new TypeError("[Component] The result of the 'view' function must not be null");
        } else if (typeof viewResult !== 'object') {
            throw new TypeError("[Component] The result of the 'view' function must be an observable or and object");
        } else if (!Objects.isSomething(viewResult.display)) {
            throw new Error("[Component] The result of the 'view' function does not provide a 'display' observable");
        } else if (!(viewResult.display instanceof Observable)) {
            throw new TypeError("[Compoennt] The 'display' property of the result of the 'view' function must be an observable");
        } else {
            const
                hasFeedbackProp = Objects.isSomething(viewResult.feedback),
                hasActionsProp = Objects.isSomething(viewResult.actions),
                hasEventsProp = Objects.isSomething(viewResult.hasEventsProp),
                hasBroadcastsProp = Objects.isSomething(viewResult.hasBroadcastProp);
                
            if (hasFeedbackProp + hasActionsProp + hasEventsProp > 1) {
                throw new Error('[Component] The result of the view function can only '
                    + ' at a maximum have one of the following properties: '
                    + "'feedback', 'actions', 'events'");
            } else if (hasFeedbackProp && !hasIntentCfg) {
                throw new Error('[Component] The result of the view function has '
                    + "a property for 'feedback' but the component configuration "
                    + "does not provide a corresponding 'intent' function");
            } else if (hasEventsProp && hasModelCfg) {
                throw new Error('[Component] The result of the view function has '
                    + "a property for 'events' so in the component configuration "
                    + "must not provide a 'model' function");
            } else if (hasEventsProp && hasEventsCfg) {
                throw new Error('[Component] The result of the view function has '
                    + "a property for 'events' so the component configuration "
                    + "must not provide a 'events' function");
            } else if (hasEventsProp && hasBroadcastsCfg) {
                throw new Error('[Component] The result of the view function has '
                    + "a property for 'events' so the component configuration "
                    + "must not provide a 'events' function");
            } else if (hasBroadcastsProp && hasBroadcastsCfg) {
                throw new Error('[Component] The result of the view function has '
                    + "a property for 'broadcasts' sothe component configuration "
                    + "must not provide a 'broadcasts' function");
            }
            
            let actions;
            
            if (hasActionsProp) {
                actions = viewResult.actions;
            } else if (hasFeedbackProp) {
                actions = config.intent(viewResult.feedback);
            } else {
                actions = Observable.empty();
            }
        
            const model =
                hasModelCfg
                ? config.model(actions, context)
                : Observable.empty();
            
            if (!(model instanceof Observable)) {
                throw new TypeError("[Component] Config function 'model' must resturn an observable");
            }
            
            model.subscribe(state => modelSbj.next(state));
            
            let events = null;
            
            if (hasEventsProp) {
                events = viewResult.events;
            } else if (hasEventsCfg) {
                events = config.events(actions);
            }
            
            let broadcasts = null;
            
            if (hasBroadcastsProp) {
                broadcasts = viewResult.broadcasts;
            } else if (hasBroadcastsCfg) {
                broadcasts = config.broadcasts(actions);
            }
            
            ret = {display: viewResult.display, events: events, broadcasts: broadcasts};
        }

        return ret;
    };
}