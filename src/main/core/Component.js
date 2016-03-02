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
            console.error('[Component.createFactory] Invalid component factory configuration:', config);
            
            throw new Error(
                    '[Component.createFactory] '
                    + configError.message);
        } 
        
        let convertedFactory;
        
        const ret = (initialProps, ...children) => {
            return convertedFactory(initialProps, children);
        };
        
        ret.meta = {
            config: config,
            normalizedConfig: normalizeConfig(config),
            Component: Component,
            convertedFactory: () => null // will be set below
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
                && componentFactory.meta.normalizedConfig
                && componentFactory.meta.convertedFactory
                && componentFactory.meta.Component === Component;
    },
    
    createEventBinder(target, mapper = event => event) {
        if (target !== undefined && target !== null
            && typeof target !== 'function'
            && typeof target.next !== 'function') {
                
            throw new TypeError(
                "[Component.createEventBinder] First argument 'target' must either be "
                + 'a callback function or an observer or null or undefined');
        } else if (typeof mapper !== 'function') {
            throw new TypeError(
                "[Component.createEventBinder] Second argument 'mapper' must "
                + 'be a function');
        }
        
        let ret;
        
        if (!target) {
            ret = () => null;
        } else if (typeof target === 'function') { 
            ret = (...args) => event => target(mapper(event, ...args));
        } else {
            ret = (...args) => event => target.next(mapper(event, ...args));
        }
    
        return ret;
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
    let error = null;
    
    const
        typeIdRegex = /^[A-Z][a-zA-Z0-9]*$/,
        propNameRegex = /^[a-z][a-zA-Z0-9]*$/,
        hasConfig = typeof config === 'object' && config !== null,
        typeIdValid = hasConfig && typeof config.typeId === 'string' && config.typeId.match(typeIdRegex),
        hasTypeIdProp = hasConfig && Objects.isSomething(config.typeId),
        hasPropertiesProp = hasConfig && Objects.isSomething(config.properties),
        hasUIProp = hasConfig && Objects.isSomething(config.ui),
        hasViewProp = hasConfig && Objects.isSomething(config.view),
        hasRenderProp = hasConfig && Objects.isSomething(config.render),
        hasModelProp = hasConfig && Objects.isSomething(config.model),
        hasEventsProp = hasConfig && Objects.isSomething(config.events),
        hasInitialStateProp = hasConfig && Objects.isSomething(config.initialState),
        hasUpdateStateProp = hasConfig && Objects.isSomething(config.updateState),
        hasYieldEvent = hasConfig && Objects.isSomething(config.yieldEvent);

    if (!hasConfig) {
        error = 'Component configuration must be an object';
    } else if (!hasTypeIdProp) {
        error = "Component configuration value 'typeId' is missing";
    } else if (!typeIdValid) {
        error = `Illegal value for 'typeId' (must match regex ${typeIdRegex})`;
    } else if (hasPropertiesProp && typeof config.properties !== 'object') {
        error = "Optional component configuration value 'properties' must be an object";
    } else if (!hasUIProp && !hasViewProp && !hasRenderProp) {
        error = "Component configuration must either provide a 'ui' function "
            + "or a 'view' function or a 'render' function";
    } else if (hasUIProp + hasViewProp + hasRenderProp > 1) {
        error = "Component configuration can only provide one of the following functions: "
            + "'ui', 'view', 'render'";
    } else if (hasUIProp && typeof config.ui !== 'function') {
        error = "Component configuration value 'ui' has to be a function";
    } else if (hasViewProp && typeof config.view !== 'function') {
        error = "Component configuration value 'view' has to be a function";
    } else if (hasRenderProp && typeof config.render !== 'function') {
        error = "Component configuration value 'render' has to be a function";
    } else if (hasViewProp && hasModelProp && typeof config.model !== 'function') {
        error = "Optional component configuration value 'model' "
            + "has to be a function if function 'view' is provided";
    } else if (hasViewProp && hasEventsProp && typeof config.events !== 'function') {
        error = "Optional component configuration value 'events' "
            + "has to be a function if function 'view' is provided";
    } else if (hasRenderProp && hasInitialStateProp && typeof config.initialState !== 'function') {
        error = "Optional component configuration value 'initialState' "
            + " has to be a function if function 'render' is provided";
    } else if (hasRenderProp && hasUpdateStateProp && typeof config.updateState !== 'function') {
        error = "Optional component configuration value 'updateState' "
            + "has to be a function if function 'render' render is provided";
    } else if (hasRenderProp && hasYieldEvent && typeof config.yieldEvent !== 'function') {
        error = "Optional component configuration value 'yieldEvent' "
            + "has to be a function if function 'render' is provided";
    } else if (hasPropertiesProp) {
        for (let property of Object.keys(config.properties)) {
            if (!property.match(propNameRegex)) {
                error = `Invalid name for property '${property} - must match regex ${propNameRegex}`;
            } else {
                const
                    propertyConfig = config.properties[property],
                    hasPropertyConfig = Objects.isSomething(propertyConfig),
                    hasTypeProp = hasPropertyConfig && Objects.isSomething(propertyConfig.type),
                    hasDefaultValueProp = hasPropertyConfig && propertyConfig.defaultValue !== undefined,
                    hasConstraintProp = hasPropertyConfig && Objects.isSomething(propertyConfig.constaint),
                    hasValidationProp = hasPropertyConfig && Objects.isSomething(propertyConfig.validation);
                
                if (!hasPropertyConfig) {
                    error = `Configuration for property '${property}' is missing`;
                } else if (typeof propertyConfig !== 'object') {
                    error = `Configuration for property '${property}' has to be an object`;
                } else if (!hasTypeProp) {
                    error = `Configuration value 'type' is missing for property '${property}'`;
                } else if (typeof property === 'symbol') {
                    error = 'Property names must not be symbols';
                } else if (property.match(/^on[A-Z]/) && propertyConfig.type !== 'function') {
                    error = "Properties with names starting with 'on[A-Z]' must be of type 'function'";
                } else if (!Array.isArray(propertyConfig.type)
                    && typeof propertyConfig.type !== 'function'
                    && (typeof propertyConfig.type !== 'string'
                    || ['string', 'number', 'boolean', 'function'].indexOf(propertyConfig.type) === -1)) {

                    error = `Configuration value 'type' for property '${property}' must either be a class/constructor `
                        + "or 'string' or 'number' or 'boolean' or an array of those type declarations";
                } else if (!hasDefaultValueProp) {
                    error = `Configuration value 'defaultValue' is missing for property '${property}'`;
                } else if (hasConstraintProp + hasValidationProp === 1) {
                    error = "Configuration values 'constraint' and 'validation' must either be provided both together"
                        + `or none of them for property '${property}'`;
                } else if (hasConstraintProp && typeof propertyConfig.constraint !== 'string') {
                    error = `Configuration value 'constraint' for property '${property}' has to be a string`;
                } else if (hasConstraintProp && propertyConfig.constraint.trim() === '') {
                    error = `Configuration value 'constraint' for property '${property}' must not be blank`;
                } else if (hasValidationProp && typeof propertyConfig.validation !== 'function') {
                    error = `Configuration value 'validation' for property '${property}' must be a function`;
                } else {
                    if (Array.isArray(propertyConfig.type)) {
                        for (let type of propertyConfig.type) {
                            if (type !== 'string' && type !== 'number'
                                && type !== 'boolean' && typeof type !== 'function') {
                                
                                error = `Array of types given in 'type' configuration of property '${property}' must either be `
                                    + "a class/constructor or 'string' or 'number' or 'boolean' or 'function'";
                                
                                break;
                            }
                        }
                    }
                }
            }
            
            if (error) {
                break;
            }
        }
    }
    
    if (error && typeIdValid) {
        error = `Configuration error for component factory of type '${config.typeId}': ${error}`;
    }
    
    return error
        ? new Error(error)
        : null;
}

function normalizeConfig(config) {
    // Config has already been checked - no need to check it again.
    
    const ret = {
        properties: {}, // will be filled below
        ui: null,       // will be set below
    };
    
    if (config.properties) {
        for (let property of Object.keys(config.properties)) {
            const propertyConfig = config.properties[property];
            
            ret.properties[property] = {
                type: propertyConfig.type,
                defaultValue: propertyConfig.defaultValue
            };
            
            if (propertyConfig.constraint) {
                ret.properties[property].constraint = propertyConfig.constraint;
                ret.properties[property].validation = propertyConfig.validation;
            }
            
            Object.freeze(ret.properties[property]);
        }
    }
    
    if (config.ui) {
        ret.ui = config.ui;
    } else if (config.view) {
        ret.ui = buildUIFunctionFromViewFunction(config);    
    } else if (config.render) {
        ret.ui = buildUIFunctionFromRenderFunction(config);
    }
    
    Object.freeze(ret);
    return ret;
}

function buildUIFunctionFromRenderFunction(config) {
    
}

function buildUIFunctionFromViewFunction(config) {
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
                hasEventsProp = Objects.isSomething(viewResult.events),
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
                : Observable.of(null);
            
            if (!(model instanceof Observable)) {
                throw new TypeError("[Component] Config function 'model' must return an observable");
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