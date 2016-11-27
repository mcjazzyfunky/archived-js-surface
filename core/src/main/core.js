import {
    defineComponent as definePlatformComponent,
    createElement as createPlatformElement,
    isElement as isPlatformElement,
    mount as mountPlatformElement
} from 'js-surface/platform';

const componentNameRegex = /^[A-Z][a-zA-Z0-9]*$/;

export function defineComponent(config) {
    const validationError = validateConfig(config, '[defineComponent] ');
    
    if (validationError) {
        throw validationError;
    }
    
    const enhancedConfig = Object.assign({}, config);
    
    const defaultValues = {};
    var hasDefaultValues = false;
    const typeChecks = [];
    
    const properties = config.properties;
    
    if (properties) {
        const propertyNames = Object.getOwnPropertyNames(properties);
        
        for (let propertyName of propertyNames) {
            const type = properties[propertyName].type;
            const defaultValue = properties[propertyName].defaultValue;
            
            if (type !== undefined && type !== null || defaultValue === undefined) {
                typeChecks.push([propertyName, type, defaultValue === undefined]);
            }
            
            if (defaultValue !== undefined) {
                hasDefaultValues = true; 
                defaultValues[propertyName] = defaultValue;
            }
        }
    }
    
    if (config.render) {
        if (typeChecks.length > 0 || hasDefaultValues) {
            enhancedConfig.render = properties => {
                if (typeChecks.length > 0) {
                    const err = checkTypes(properties, typeChecks,
                            config.name, 'properties');
                    
                    if (err) {
                        console.error('Error: ' + err.message);
                    }
                }   

                const props =  hasDefaultValues
                    ? Object.assign({}, defaultValues, properties)
                    : properties;
                
                return config.render(props);
            };
        }
    } else {
        // TODO - add some return validation in enhanced initialize function
        enhancedConfig.initialize = inputs => {
            const enhancedInputs = !hasDefaultValues && typeChecks.length == 0
                ? inputs
                : inputs.map(properties => {
                    let ret = properties;
                    
                    const err = checkTypes(properties, typeChecks,
                            config.name, 'properties');
                    
                    if (err) {
                        console.error('Error: ' + err.message);
                    }
                    
                    if (hasDefaultValues) {
                        ret = Object.assign({}, defaultValues, properties);
                    }
                    
                    return ret;
                });
        
            return config.initialize(enhancedInputs);
        };
    }

    return definePlatformComponent(enhancedConfig);
}

export function createElement(tags, props, ...children) {
    return createPlatformElement(tags, props, ...children);
}

export function isElement(what) {
    return isPlatformElement(what);
}

export function mount(element, targetNode) {
    mountPlatformElement(element, targetNode);
}

function validateConfig(config, errMsgPrefix = null) {
    var ret = null, errMsg = '';
    
    if (config === undefined) {
        errMsg = 'Configuration must not be undefined';
    } else if (config === null) {
        errMsg = 'Configuration must not be null';
    } else if (typeof config !== 'object') {
        errMsg = 'Configuration must be an object';
    } else if (config.name === undefined || config.name === null) {
        errMsg = "Configuration parameter 'name' is missing"; 
    } else if (typeof config.name !== 'string') {
        errMsg = "Configuration parameter 'name' must be a string";
    } else if (!config.name.match(componentNameRegex)) {
        errMsg = "Configuration parameter 'name' must match with regex "
            + componentNameRegex + ` (given '${config.name}')`;
    } else if (config.render === undefined && config.initialize === undefined) {
        errMsg = "Either configuration parameter 'render' "
            + "or parameter 'initialize' must be set";
    } else if (config.render !== undefined && config.initialize !== undefined) {
        errMsg = "Configuration parameters 'render' and 'initialize' must not "
            + 'be set both';
    } else if (config.render !== undefined && typeof config.render !== 'function') {
        errMsg = "Configuration parameter 'render' must be a function";
    } else if (config.initialize !== undefined && typeof config.initialize !== 'function') {
        errMsg = "Configuration parameter 'inititialize' must be a function";
    }
    
    for (let paramName of ['properties', 'contributions']) {
        if (config[paramName] !== undefined
            && (config[paramName] === null || typeof config[paramName] !== 'object')) {
        
            errMsg = `Confguration parameter '${paramName}' `
                   + "must either be be an object or undeclared";
        } else {
            const
                subConfig = config[paramName] || {},
                propNames = Object.getOwnPropertyNames(subConfig);
            
            for (let propName of propNames) {
                const
                    propValue = subConfig[propName],
                    typeOfPropValue = typeof propValue;
                
                if (propValue === undefined) {
                   errMsg = `Configuration parameter '${paramName}.${propName}' ` 
                        + 'must no be set to undefined';
                } else if (propValue === null) {
                    errMsg = `Configuration parameter '${paramName}.${propName}' ` 
                        + 'must no be null';
                } else if (typeOfPropValue !== 'object') {
                    errMsg = `Configuration parameter '${paramName}.${propName} `
                        + 'must be a an object'; 
                } else if (typeof propValue.type !== 'function') {
                    errMsg = `Configuration parameter '${paramName}.${propName}.type' `
                        + ' must be a function';
                } else if (propValue.inject !== undefined && typeof propValue.inject !== 'boolean') {
                    errMsg = `Configuration parameter '${paramName}.${propName}.inject' `
                        + ' must be boolean';
                }
                
                if (errMsg) {
                    break;
                }
            }
        }
        
        if (errMsg) {
            break;
        }
    }
    
    if (errMsg) {
        var fullErrMsg = errMsg;
       
        if (config !== null
            && typeof config === 'object'
            && typeof config.name === 'string'
            && config.name.match(componentNameRegex)) {
                
            fullErrMsg = `Component definition of '${config.name}': ${fullErrMsg}`;
        }
        
        if (errMsgPrefix !== null) {
            fullErrMsg = errMsgPrefix + ' ' + fullErrMsg;
        }
        
        fullErrMsg = fullErrMsg.trim(); 
        ret = new Error(fullErrMsg);
    }
    
    return ret;
}

function checkTypes(properties, typeChecks, componentName, propsKind) {
   let err = null; 
    
    for (let [propertyName, type, required] of typeChecks) {
        let err = null;
        
        if (required && properties[propertyName] === undefined) {
            err = new Error(`Missing mandatory property '${propertyName}' for '${componentName}'`);
        }
        
        if (!err && type) {
            err = type(properties, propertyName, componentName, propsKind);
        }
        
        if (err) {
            const msg = ('' + err)
                .replace(/^\s*(Error|Warning)\s*(:?)\s*/i, '')
                .replace(/(\s|\.)+$/, '')
                .replace(/`/g, "'")
                .replace(/^./, first => first.toUpperCase())
                .trim();
            
            console.error('Error: ' + msg);
        }
    }
    
    return err;
}
