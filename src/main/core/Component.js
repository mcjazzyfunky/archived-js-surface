'use strict';

import ComponentAdapter from 'js-bling-adapter';
import {Observable, Subject} from 'rxjs';
import {Objects,Config} from 'js-prelude';

try {
    if (!ComponentAdapter || typeof ComponentAdapter !== 'object') {
        throw new TypeError("The imported module for 'js-bling-adapter' did not return a proper ComponentAdapter");
    } else if (typeof ComponentAdapter.createElement !== 'function') {
        throw new TypeError("The component adapter of module 'js-bling-adapter' does not provide a 'createElement' function");
    } else if (typeof ComponentAdapter.isElement !== 'function') {
        throw new TypeError("The component adapter of module 'js-bling-adapter' does not provide a 'isElement' function");
    } else if (typeof ComponentAdapter.createAdaptedFactory !== 'function') {
        throw new TypeError("The component adapter of module 'js-bling-adapter' does not provide a 'createAdaptedFactory' function");
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
            ? tag.adaptedFactory(props, children)
            : ComponentAdapter.createElement(tag, props, children);    
    },
    
    isElement(obj) {
        return ComponentAdapter.isElement(obj);
    },
    
    createFactory(config) {
        const configError = checkComponentFactoryConfig(config);
        
        if (configError) {
            console.error('[Component.createFactory] Invalid component factory configuration:', config);
            
            throw new Error(
                    '[Component.createFactory] '
                    + configError);
        } 
        
        const ret = (initialProps, ...children) => {
            return ret.adaptedFactory(initialProps, children);
        };
        
        try {
            ret.__meta = buildComponentMeta(config, ret);
            ret.adaptedFactory = ComponentAdapter.createAdaptedFactory(createAdaptionParams(ret.__meta));
        } catch (err) {
            console.error(
                `[Component.createFactory] Erroneous configuration of component factory '${config.typeId}':`,
                config);
            
            throw new Error(
                `[Component.createFactory] Could not convert component factory '${config.typeId}': ${err.message}`);
        }

        
        Object.freeze(ret.__meta);
        Object.freeze(ret);
        
        return ret;
    },

    isFactory(componentFactory) {
        return typeof componentFactory === 'function'
                && componentFactory.adaptedFactory
                && !!componentFactory.__meta;
    },
    
    createEventBinder(target, mapper = event => event) {
        if (target !== undefined && target !== null
            && typeof target !== 'function'
            && typeof target.next !== 'function') {
                
            throw new TypeError(
                "[Component.createEventBinder] First argument 'target' must either be "
                + 'a callback function or an subject or null or undefined');
        } else if (typeof mapper !== 'function') {
            throw new TypeError(
                "[Component.createEventBinder] Second argument 'mapper' must "
                + 'be a function');
        }
        
        let ret;
        
        if (!target) {
            ret = () => null;
        } else {
            const consumer =
                typeof target === 'function'
                ? event => { event === undefined || event === null || target(event) }
                : event => { event === undefined || event === null || target.next(event) };
            
            ret = (...args) => event => consumer(mapper(event, ...args));
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
            Component.isFactory(content) ? content() : content,
            mountNode);
    }
};

export default Component;

function checkComponentFactoryConfig(config) {
    let ret = null;
    
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
        hasPublishProp = hasConfig && Objects.isSomething(config.publish);

    try {
        if (!hasConfig) {
           throw 'Component configuration must be an object';
        } else if (!hasTypeIdProp) {
            throw "Component configuration value 'typeId' is missing";
        } else if (!typeIdValid) {
            throw `Illegal value for 'typeId' (must match regex ${typeIdRegex})`;
        } else if (hasPropertiesProp && typeof config.properties !== 'object') {
            throw "Optional component configuration value 'properties' must be an object";
        } else if (!hasUIProp && !hasViewProp && !hasRenderProp) {
            throw "Component configuration must either provide a 'ui' function "
                + "or a 'view' function or a 'render' function";
        } else if (hasUIProp + hasViewProp + hasRenderProp > 1) {
            throw "Component configuration can only provide one of the following functions: "
                + "'ui', 'view', 'render'";
        } else if (hasUIProp && typeof config.ui !== 'function') {
            throw "Component configuration value 'ui' has to be a function";
        } else if (hasViewProp && typeof config.view !== 'function') {
            throw "Component configuration value 'view' has to be a function";
        } else if (hasRenderProp && typeof config.render !== 'function') {
            throw "Component configuration value 'render' has to be a function";
        } else if (hasViewProp && hasModelProp && typeof config.model !== 'function') {
            throw "Optional component configuration value 'model' "
                + "has to be a function if function 'view' is provided";
        } else if (hasViewProp && hasEventsProp && typeof config.events !== 'function') {
            throw "Optional component configuration value 'events' "
                + "has to be a function if function 'view' is provided";
        } else if (hasRenderProp && (hasInitialStateProp + hasUpdateStateProp) === 1) {
            throw 'Either both or none of the component configuration parameters '
                + "'initialState' and 'updateState' "
                + " have to be configured if function 'render' is provided";
        } else if (hasRenderProp && hasUpdateStateProp && typeof config.updateState !== 'function') {
            throw "Optional component configuration value 'updateState' "
                + "has to be a function if function 'render' render is provided";
        } else if (hasRenderProp && hasPublishProp && config.publish !== 'function') {
            throw "Optional component configuration value 'publish' "
                + "has to be a function if function 'render' is provided";
        } else if (hasPropertiesProp) {
            for (let property of Object.keys(config.properties)) {
                if (!property.match(propNameRegex)) {
                   throw `Invalid name for property '${property} - must match regex ${propNameRegex}`;
                }
                
                const
                    propertyConfig = config.properties[property],
                    hasPropertyConfig = Objects.isSomething(propertyConfig),
                    hasTypeProp = hasPropertyConfig && Objects.isSomething(propertyConfig.type),
                    hasDefaultValueProp = hasPropertyConfig && propertyConfig.defaultValue !== undefined,
                    hasConstraintProp = hasPropertyConfig && Objects.isSomething(propertyConfig.constaint),
                    hasValidationProp = hasPropertyConfig && Objects.isSomething(propertyConfig.validation);
                
                if (!hasPropertyConfig) {
                    throw `Configuration for property '${property}' is missing`;
                } else if (typeof propertyConfig !== 'object') {
                    throw `Configuration for property '${property}' has to be an object`;
                } else if (!hasTypeProp) {
                    throw `Configuration value 'type' is missing for property '${property}'`;
                } else if (typeof property === 'symbol') {
                    throw 'Property names must not be symbols';
                } else if (property.match(/^on[A-Z]/) && propertyConfig.type !== 'function') {
                    throw "Properties with names starting with 'on[A-Z]' must be of type 'function'";
                } else if (!Array.isArray(propertyConfig.type)
                    && typeof propertyConfig.type !== 'function'
                    && (typeof propertyConfig.type !== 'string'
                    || ['string', 'number', 'boolean', 'function'].indexOf(propertyConfig.type) === -1)) {

                    throw `Configuration value 'type' for property '${property}' must either be a class/constructor `
                        + "or 'string' or 'number' or 'boolean' or an array of those type declarations";
                } else if (!hasDefaultValueProp) {
                    throw `Configuration value 'defaultValue' is missing for property '${property}'`;
                } else if (hasConstraintProp + hasValidationProp === 1) {
                    throw "Configuration values 'constraint' and 'validation' must either be provided both together"
                        + `or none of them for property '${property}'`;
                } else if (hasConstraintProp && typeof propertyConfig.constraint !== 'string') {
                    throw `Configuration value 'constraint' for property '${property}' has to be a string`;
                } else if (hasConstraintProp && propertyConfig.constraint.trim() === '') {
                    throw `Configuration value 'constraint' for property '${property}' must not be blank`;
                } else if (hasValidationProp && typeof propertyConfig.validation !== 'function') {
                    throw `Configuration value 'validation' for property '${property}' must be a function`;
                }
                
                if (Array.isArray(propertyConfig.type)) {
                    for (let type of propertyConfig.type) {
                        if (type !== 'string' && type !== 'number'
                            && type !== 'boolean' && typeof type !== 'function') {
                            
                            throw `Array of types given in 'type' configuration of property '${property}' must either be `
                                + "a class/constructor or 'string' or 'number' or 'boolean' or 'function'";
                        }
                    }
                }
            }
        }
    } catch (error) {
        if (typeof error !== 'string') {
            throw error;
        }
        
        ret = error;
    }    
    if (ret && typeIdValid) {
        ret = `Configuration error for component factory of type '${config.typeId}': ${ret}`;
    }
    
    return ret; 
}



// @throws TypeError
function buildComponentMeta(config) {
    // Config has already been checked - no need to check it again.
    
    const ret = {
        config,
        properties: {}, // will be filled below
        propertyNames: new Set(),
        eventNames: new Set()
    };
    
    if (config.properties) {
        for (let property of Object.keys(config.properties)) {
            if (typeof property === 'symbol') {
                throw new TypeError(`Symbols are not allowed as component property names (symbol: ${property})`);
            } else if (!property.match(/^[a-z]+($|[A-Z][a-zA-Z0-9]*$)/)) {
                throw new TypeError(`Illegal property name '${property}'`)
            }
            
            const propertyConfig = config.properties[property];
            
            ret.properties[property] = {
                type: propertyConfig.type,
                defaultValue: propertyConfig.defaultValue
            };
            
            if (propertyConfig.constraint) {
                ret.properties[property].constraint = propertyConfig.constraint;
                ret.properties[property].validation = propertyConfig.validation;
            }
            
            ret.propertyNames.add(property);
            
            if (property.match(/^on[A-Z]/)) {
                ret.eventNames.add(property.charAt(2).toLowerCase() + property.substring(3));
            }
            
            Object.freeze(ret.properties[property]);
        }
    }
    
    return ret;
}

function createAdaptionParams(componentMeta) {
    const
        config = componentMeta.config,

        ret = {
            config: config,
            validateAndMapProps: createPropsValidatorAndMapper(componentMeta),
            ui: null // will be set below
        };

    if (config.ui) {
        ret.ui = config.ui;
    } else if (config.view) {
        ret.ui = buildUIFunctionFromViewFunction(config);
    } else if (config.render) {
        ret.ui = buildUIFunctionFromRenderFunction(config);
    }

    return ret;
}

// @throws Error
function createPropsValidatorAndMapper(componentMeta) {
    return props => {
        const
            ret = props instanceof Config ? props : new Config(props),
            errorMsg = checkProperties(ret, componentMeta);

        if (errorMsg) {
            const typeId = componentMeta.config.typeId;

            console.error(`Invalid properties for component of type '${typeId}':`, props);
            throw new Error('[Component] ' + errorMsg);
        }

        return ret;
    };
}

function checkProperties(props, componentMeta) { // It's ensured that the arguments are fine - no need to validate them
    let ret = '';

    const
        config = componentMeta.config,
        properties = config.properties,
        propNames = props.keys();

    // Check for unkown property keys
    for (let propName of propNames) {
        if (propName !== 'children') {
            if (typeof propName === 'symbol') {
                ret = `Property key '${propName}' must not be a symbol`;
            } else if (!properties || !properties[propName]) {
                ret = `Unknown property key '${propName}'`;
            }

            if (ret) {
                break;
            }
        }
    }

    if (!ret) {
        for (let propName of propNames) {
            if (propName !== 'children') {
                const defaultValue = properties[propName].defaultValue;

                let propValue;

                try {
                    propValue = props.get(propName, defaultValue);
                } catch (error) {
                    ret = error.message;
                    break;
                }

                ret = checkProperty(propName, propValue, config.properties);

                if (ret) {
                    break;
                }
            }
         }
    }

    return ret;
}

function checkProperty(propName, propValue, propConfig) {
    let ret = null;

    try {
        if (typeof propName === 'symbol') {
            throw `Property must not be a symbol (${propName}')`;
        }

        if (propConfig === null && typeof propConfig !== 'object') {
            throw `Component does not have a property '${propName}'`;
        }
    } catch (error) {
        if (typeof error !== 'string') {
            throw error;
        }

        ret = error;
    }

    return ret;
}

// @throws Error
function buildUIFunctionFromRenderFunction(config) {
    const {properties, render, publish, initialState, updateState} = config;
    
    if (properties !== undefined && (properties === null || typeof properties !== 'object')) {
        throw new TypeError("Property 'properties' must be an object or undefined");
    } else if (updateState === null) {
        throw new TypeError("Function 'updateState' must not be null");
    } else if (updateState !== undefined && typeof updateState !== 'function') {
        throw new TypeError("Function 'updateState' must be a function or undefined");
    } else if (publish === null) {
        throw new TypeError("Function 'publish' must not be null");
    } else if (publish !== undefined && typeof publish !== 'function') {
        throw new TypeError("Function 'publish' must be a function or undefined");
    } else if (updateState && initialState === 'undefined' ) {
        throw new TypeError("Function 'updateState' has been provided without also providing 'initialState'");
    } else if (initialState !== undefined && !updateState) {
        throw new TypeError("Property 'initialState' has been provided without also providing function 'updateState'");
    }

    const eventNames = new Set();

    if (properties) {
        for (let property of Object.keys(properties)) {
            if (property.match(/^on[A-Z]/)) {
                eventNames.add(property.charAt(2).toLowerCase() + property.substring(3));
            }
        };
    }

    return behavior => {
        const
            actions = new Subject(),

            events = {}, // will be filled below
        
            model =
                !updateState
                ? Observable.of(null)
                : actions
                    .startWith(initialState) // TODO: initialState may also be a function
                    .scan((state, action) => {
                            let ret = state;
                            
                            try {
                                ret = updateState(action, state); 
                            } catch (err) {
                                setTimeout(() => { throw err; }, 0); // TODO - prevent that events are published
                            }
                            
                            return ret;
                    });
    
        for (let eventName of eventNames) {
            events[eventName] = new Subject();
        }
        
        const contents = behavior.combineLatest(model, (props, state) => {
            let ret;
            
            const result = render(props, state);
            
            if (Component.isElement(result)) {
                if (updateState) {
                    throw new TypeError(
                        "Function 'updateState' is provided therefore function "
                        + "'render' must return an object with both properties "
                        + "'content' and 'actions'");
                }
                
                ret = result;
            } else if (result === null || typeof result !== 'object' || result.content === undefined) {
                throw new TypeError(
                    "Function 'render' must either return an Observable or an object "
                    + "containing at least property 'content'");
            } else if (updateState && result.actions === undefined) {
                throw new TypeError(
                    "Function 'updateState' is provided therefore the object returned "
                    + "by function 'render' must have a property 'actions'");
            } else if (!updateState && result.actions !== undefined) {
                throw new TypeError(
                    "Function 'updateState' is not provided therefore the object returned "
                    + "by function 'render' must not have a property 'actions'");
            } else if (result.events === null) {
                throw new TypeError(
                    "The property 'events' of the object returned by function 'render' "
                    + 'must not be null');
            } else if (result.events !== undefined && typeof result.events !== 'object') {
                throw new TypeError(
                    "The property 'events' of the object returned by function 'render' "
                    + 'has to be an object or undefined');
            } else if (publish && result.events !== undefined) {
                throw new TypeError(
                    "Function 'publish' is provided therefore the object returned "
                    + "by function 'render' must not have a property 'actions'"); 
            } else if (result.actions !== undefined && !(result.actions instanceof Observable)) {
                throw new TypeError(
                    "Property 'actions' of the object returned by function 'render' must be "
                    + 'an observable or undefined');
            } else if (result.events && result.actions) {
                throw new TypeError(
                    "The object returned by function 'render' must not have both properties "
                    + "'actions' and 'events' together");
            } else {
                let toPublish =  null;

                if (result.actions) {
                    result.actions.subscribe(actions); // TODO - unsubscribe???
                
                    if (publish) {
                        result.actions.subscribe(action => {
                            const toPublish = publish(action, props, state);
                            
                            if (toPublish !== undefined && toPublish !== null && typeof toPublish !== 'object') {
                                throw new TypeError(
                                    "The return value of function 'publish' must be undefined, null or an object");
                            }
                        }); 
                    }
                } else if (result.events) {
                    toPublish = result.events;
                }
                
                if (toPublish) {
                    for (let eventName of Object.keys(toPublish)) {
                        if (!eventNames.has(eventName)) {
                            throw new TypeError(
                                !result.events
                                
                                ? "The object returned by function 'publish' contains a property "
                                + `of name '${eventName}' which is not a known event name`
                                
                                : "The object returned by function 'render' contains a property "
                                + `'events' which has a property '${eventName}' which is not a knwon event name`);
                        }

                        toPublish[eventName].subscribe(events[eventName]);
                    }
                }
                
                ret = result.content;
            }
            
            return ret;
        });
    
        return {
            contents,
            events
        };
    };
}

function buildUIFunctionFromViewFunction(config) {
    let model = null;

    return (behavior, dependencies) => {
        const
            hasModelCfg = !!config.model,
            hasEventsCfg = !!config.events,

            modelProxy =
                !hasModelCfg
                ? Observable.of(null)
                : Observable.create(observer => model.subscribe(observer)),
            
            viewResult = config.view(behavior, modelProxy);
            
        let ret;

        if (viewResult instanceof Observable) {
            if (hasModelCfg || hasEventsCfg) {
                throw new TypeError(
                    "[Component] The result of the 'view' function must be an object containing "
                    + " the property 'actions' as 'model' or/and 'events' are configured");
            }
            
            ret = {contents: viewResult, events: null};
        } else if (viewResult === null) {
            throw new TypeError("[Component] The result of the 'view' function must not be null");
        } else if (typeof viewResult !== 'object') {
            throw new TypeError("[Component] The result of the 'view' function must be an observable or and object");
        } else if (!Objects.isSomething(viewResult.contents)) {
            throw new TypeError("[Component] The result of the 'view' function does not provide a 'contents' observable");
        } else if (!(viewResult.contents instanceof Observable)) {
            throw new TypeError("[Compoennt] The 'contents' property of the result of the 'view' function must be an observable");
        } else {
            const
                hasActionsProp = Objects.isSomething(viewResult.actions),
                hasEventsProp = Objects.isSomething(viewResult.events);
                
            if (hasActionsProp + hasEventsProp > 1) {
                throw new Error("[Component] The result of function 'view' can only "
                    + " contain either an 'action' property or an 'view' not both ")
            } else if (hasEventsProp && hasModelCfg) {
                throw new Error("[Component] The result of function 'view' has "
                    + "a property for 'events' so the component configuration "
                    + "must not provide a 'model' function");
            } else if (hasEventsProp && hasEventsCfg) {
                throw new Error("[Component] The result of the function 'view' has "
                    + "a property for 'events' so the component configuration "
                    + "must not provide a 'events' function");
            }
            
            let actions;
            
            if (hasActionsProp) {
                actions = viewResult.actions;
            } else {
                actions = Observable.empty();
            }
        
            
            let events = null;
            
            if (hasEventsProp) {
                events = viewResult.events;
            } else if (hasEventsCfg) {
                events = config.events(actions);
            }
           
           
            if (hasModelCfg) {
               model = config.model(actions);
                
                if (!(model instanceof Observable)) {
                    throw new TypeError("[Component] Config function 'model' must return an observable");
                }
            }
            
            ret = {contents: viewResult.contents, events: events};
        
        }

        return ret;
    };
}
