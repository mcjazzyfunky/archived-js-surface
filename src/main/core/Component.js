'use strict';

import ComponentAdapter from 'js-bling-adapter';
import {Observable, Subject} from 'rxjs';
import {Strings, Types, Config, ConfigError} from 'js-prelude';

{
    let error = null;

    if (!ComponentAdapter) {
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

/**
 * Non-instantiable component utility class with static methods to create component factories
 * and handle components and their events.
 */
export default class Component {
    /**
     * @ignore
     */
    constructor() {
        throw new Error('[Component.constructor] Class Component is not instantiable');
    }

    static createElement(tag, props, ...children) {
        if (tag === undefined || tag === null) {
            throw new TypeError("[Component.createElement] First argument 'tag' must not be empty");    
        }

        return Component.isFactory(tag)
            ? tag.adaptedFactory(props, children)
            : ComponentAdapter.createElement(tag, props, children);    
    }
    
    static isElement(obj) {
        return ComponentAdapter.isElement(obj);
    }
    
    static createFactory(factoryConfig) {
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
    }

    static isFactory(componentFactory) {
        return typeof componentFactory === 'function'
                && typeof componentFactory.adaptedFactory === 'function'
                && componentFactory.__meta
                && typeof componentFactory.__meta === 'object';
    }
    
    static mount(content, targetNode) {
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

    /**
     * @ignore
     */
    static toString() {
        return 'Component/class'
    }
};

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

            initialState:
                config.get('initialState', null),

            stateUpdate:
                config.getFunction('stateUpdate', null),

            control:
                config.getFunction('control', null),

            render:
                config.getFunction('render'),

            onMounted:
                config.getFunction('onMounted', null),

            onRendered:
                config.getFunction('onRendered', null)
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
        initialState: componentMeta.initialState,
        stateUpdate: componentMeta.stateUpdate,
        control: componentMeta.control,
        render: componentMeta.render,
        defaultProps: defaultProps,
        onMounted: componentMeta.onMounted,
        onRendered: componentMeta.onRendered
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


