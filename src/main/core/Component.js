'use strict';

import ComponentAdapter from 'js-bling-adapter';
import {Observable, Subject} from 'rxjs';
import {Strings, Types, Config, ConfigError} from 'js-prelude';

{
    let error = null;

    if (!ComponentAdapter || typeof ComponentAdapter !== 'object') {
        error = "The imported module for 'js-bling-adapter' did not return a proper ComponentAdapter";
    } else if (typeof ComponentAdapter.createElement !== 'function') {
        error = "The component adapter of module 'js-bling-adapter' does not provide a 'createElement' function";
    } else if (typeof ComponentAdapter.isElement !== 'function') {
        error = "The component adapter of module 'js-bling-adapter' does not provide a 'isElement' function";
    } else if (typeof ComponentAdapter.createAdaptedFactory !== 'function') {
        error = "The component adapter of module 'js-bling-adapter' does not provide a 'createAdaptedFactory' function";
    } else if (typeof ComponentAdapter.mount !== 'function') {
        error = "The component adapter of module 'js-bling-adapter' does not provide a 'mount' function";
    }

    if (error) {
        console.error('[Component] Invalid component adapter (please check your module configuration):', ComponentAdapter);
        throw new TypeError('[Component] ' + error);
    }
}

const Component = {
    createElement(tag, props, ...children) {
        if (tag === undefined || tag === null) {
            throw new TypeError("[Component.createElement] First argument 'tag' must not be empty");    
        }

        return Component.isFactory(tag)
            ? tag.adaptedFactory(props, children)
            : ComponentAdapter.createElement(tag, props, children);    
    },
    
    isElement(obj) {
        return ComponentAdapter.isElement(obj);
    },
    
    createFactory(factoryConfig) {
        if (!factoryConfig || typeof factoryConfig !== 'object') {
            console.error('[Component.createFactory] Illegal factory configuration:', factoryConfig);
            throw new TypeError("[Component.createFactory] First argument 'factoryConfig' must be an object");
        }

        const
            config = new Config(factoryConfig), // TODO: add options argument

            ret = (initialProps, ...children) => {
                return ret.adaptedFactory(initialProps, children);
            };

        try {
            ret.__meta = buildComponentMeta(config, ret);
            ret.adaptedFactory = ComponentAdapter.createAdaptedFactory(buildAdaptionParams(ret.__meta));
        } catch (err) {
            if (!(err instanceof ConfigError)) {
                throw err;
            }

            const typeIdInfo = !ret.__meta || !ret.__meta.typeId ? '' : ` '${ret.__meta.typeId}'`;

            console.error(
                `[Component.createFactory] Erroneous configuration of component factory${typeIdInfo}:`,
                config);
            
            throw new Error(
                `[Component.createFactory] Could not convert component factory${typeIdInfo}: ${err.message}`);
        }

        Object.freeze(ret);
        return ret;
    },

    isFactory(componentFactory) {
        return typeof componentFactory === 'function'
                && typeof componentFactory.adaptedFactory === 'function'
                && componentFactory.__meta
                && typeof componentFactory.__meta === 'object';
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
                "[Component.createEventBinder] Second argument 'mapper' must 'be a function");
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
                  + (typeof targetNode !== 'string' ? '' : ` '${targetNode}'`));
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

// @throws
function buildComponentMeta(config) {
    const
        typeIdRegex = /^[A-Z][a-zA-Z0-9]*$/,
        properties = normalizeProperties(config),
        propertyNames = !properties ? [] : Object.keys(properties),

        ret = {
            typeId: config.getStringMatchingRegex(typeIdRegex, 'typeId'),
            properties: properties,
            propertyNames: new Set(propertyNames),

            mandatoryPropertyNames:
                new Set(
                    propertyNames
                        .filter(name => properties[name].defaultValue === undefined)),

            eventNames:
                new Set(
                    propertyNames
                        .filter(name => name.match(/^on[A-Z]/))
                        .map(name => name.charAt(2).toLowerCase() + name.substring(3))),

            ui: normalizeUI(config),

            lifecycleCallbacks: {
                onMount: config.getFunction('onMount', null)
            }
        };

    Object.freeze(ret);
    return ret;
}

function buildAdaptionParams(componentMeta) {
    const defaultProps = {};

    if (componentMeta.properties) {
        Object.keys(componentMeta.properties).forEach(property => {
            const defaultValue = componentMeta.properties[property].defaultValue;

            if (defaultValue !== undefined) {
                defaultProps[property] = defaultValue;
            }
        });
    }

    const ret = {
        typeId: componentMeta.typeId,
        validateAndMapProps: createPropsValidatorAndMapper(componentMeta),
        ui: componentMeta.ui,
        defaultProps: defaultProps,
        lifecycleCallbacks: componentMeta.lifecycleCallbacks
    };

    return ret;
}

function normalizeProperties(config) {
    const
        propsConfig = config.getConfig('properties', null),
        propNameRegex = /^[a-z][a-zA-Z0-9]*$/,
        propNames = propsConfig === null ? [] : propsConfig.keys(propNameRegex),
        ret = propNames.length === 0 ? null : {};

    for (let propName of propNames) {
        const
            propConfig = config.getConfig(['properties', propName]),
            defaultValue = propConfig.isDefined('defaultValue') ? propConfig.get('defaultValue') : undefined,
            type = validatePropertyTypeConfiguration(propConfig.get('type')),
            options = validatePropertyOptionsConfiguration(propConfig.getArray('options', null), type),
            rule = propConfig.getNonBlankString('rule', null),
            validation = propConfig.getFunction('validation', null);

        if (rule && !validation) {
            throw new ConfigError(`Missing 'validation' function for property '${propName}'`);
        } else if (validation && !rule) {
            throw new ConfigError(`Missing 'rule' string for property '${propName}'`);
        }

        ret[propName] = {
            type: type,
            options: options && options.length > 0 ? options : null,
            defaultValue: defaultValue,
            rule: rule,
            validation: validation
        }
    }

    return ret;
}

function normalizeUI(config) {
    // Already ensured that argument 'config' is an instance of class Config

    let ret;

    const
        initialState = config.isDefined('initialState') ? config.get('initialState') : undefined,
        updateState = config.getFunction('updateState', null),
        ui = config.getFunction('ui', null),
        events = config.getFunction('events', null),
        view = config.getFunction('view', null),
        model = config.getFunction('model', null),
        render = config.getFunction('render', null),
        publish = config.getFunction('publish', null);

    if (!ui && !view && !render) {
        throw new ConfigError("One of the function 'ui', 'view' or 'render' must be provided");
    } else if (!!ui + !!view + !!render > 1) {
        throw new ConfigError("Only one of the functions 'ui', 'view' or 'render' shall be provided");
    } else if (view) {
        ret = buildUIFunctionFromViewFunction(config);
    } else if (render) {
        if (initialState !== undefined && !updateState) {
            throw new ConfigError("Missing function 'updateState'");
        } else if (updateState && initialState === undefined) {
            throw new ConfigError("Missing parameter 'initialState");
        }

        ret = buildUIFunctionFromRenderFunction(config);
    } else {
        ret = ui;
    }

    return ret;
}

function validatePropertyTypeConfiguration(type) {
    // Already ensured that argument 'type' is something

    // TODO - implement
    return type;
}

function validatePropertyOptionsConfiguration(options, type) {
    // Already ensured that argument 'options' is an array and property 'type' is set properly

    // TODO - implement
    return options;
}


// @throws Error
function createPropsValidatorAndMapper(componentMeta) {
    return props => {
        const
            ret = props instanceof Config ? props : new Config(props),
            errorMsg = checkProperties(ret, componentMeta);

        if (errorMsg) {
            const typeId = componentMeta.typeId;

            console.error(`Invalid properties for component of type '${typeId}':`, props);
            throw new Error('[Component] ' + errorMsg);
        }

        return ret;
    };
}

function checkProperties(props, componentMeta) { // It's ensured that the arguments are fine - no need to validate them
    let ret = '';

    const
        properties = componentMeta.properties,
        propNames = props.keys();

    // Check for unknown property keys
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

    // Check for missing mandatory properties
    for (let propName of componentMeta.mandatoryPropertyNames) {
        if (!props.isDefined(propName)) {
            ret = `Property '${propName}' is missing`;
            break;
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

                ret = checkProperty(propName, propValue, componentMeta.properties[propName]);

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
    const
        properties = config.getObject('properties', null),
        render = config.getFunction('render', null),
        initialState = config.get('initialState', null),
        updateState = config.getFunction('updateState', null),
        publish = config.getFunction('publish', null),
        eventNames = new Set();

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
    const
        view = config.getFunction('view'),
        model = config.get('model', null),
        events =config.get('events', null);

    return behavior => {
        const
            modelProxy =
                !model
                ? Observable.of(null)
                : Observable.create(observer => model.subscribe(observer)),
            
            viewResult = view(behavior, modelProxy);
            
        let ret;

        if (viewResult instanceof Observable) {
            if (model || events) {
                throw new TypeError(
                    "[Component] The result of the 'view' function must be an object containing "
                    + " the property 'actions' as 'model' or/and 'events' are configured");
            }
            
            ret = {contents: viewResult, events: null};
        } else if (viewResult === null) {
            throw new TypeError("[Component] The result of the 'view' function must not be null");
        } else if (typeof viewResult !== 'object') {
            throw new TypeError("[Component] The result of the 'view' function must be an observable or and object");
        } else if (!Types.isSomething(viewResult.contents)) {
            throw new TypeError("[Component] The result of the 'view' function does not provide a 'contents' observable");
        } else if (!(viewResult.contents instanceof Observable)) {
            throw new TypeError("[Compoent] The 'contents' property of the result of the 'view' function must be an observable");
        } else {
            const
                hasActionsProp = Types.isSomething(viewResult.actions),
                hasEventsProp = Types.isSomething(viewResult.events);
                
            if (hasActionsProp + hasEventsProp > 1) {
                throw new Error("[Component] The result of function 'view' can only "
                    + " contain either an 'action' property or an 'view' not both ")
            } else if (hasEventsProp && model) {
                throw new Error("[Component] The result of function 'view' has "
                    + "a property for 'events' so the compoent configuration "
                    + "must not provide a 'model' function");
            } else if (hasEventsProp && events) {
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
        
            
            let publishing = null;
            
            if (hasEventsProp) {
                publishing = viewResult.events;
            } else if (events) {
                publishing = events(actions);
            }
           
            if (model) {
               const states = model(actions);

                if (!(states instanceof Observable)) {
                    throw new TypeError("[Component] Config function 'model' must return an observable");
                }
            }
            
            ret = {contents: viewResult.contents, events: publishing};
        }

        return ret;
    };
}

