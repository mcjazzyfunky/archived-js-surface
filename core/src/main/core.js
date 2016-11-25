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
    
    
    // TODO - add some return validation in enhanced initialize function
    enhancedConfig.initialize = inputs => {
        const enhancedInputs = !hasDefaultValues && typeChecks.length == 0
            ? inputs
            : inputs.map(properties => {
                let ret = properties;
                
                for (let [propertyName, type, required] of typeChecks) {
                    let err = null;
                    
                    if (required && properties[propertyName] === undefined) {
                        err = new Error(`Missing mandatory property '${propertyName}' for '${config.name}'`);
                    }
                    
                    if (!err && type) {
                        err = type(properties, propertyName, config.name, 'property');
                    }
                    
                    if (err) {
                        const msg = ('' + err)
                            .replace(/^(Error|Warning)\s*(:?)\s*/i, '')
                            .replace(/(\s|\.)+$/, '');
                        
                        console.error('Error: ' + msg)
                    }
                }
                
                if (hasDefaultValues) {
                    ret = Object.assign({}, defaultValues, properties);
                }
                
                return ret;
            });
    
        return config.initialize(enhancedInputs);
    };
    
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
    } else if (config.initialize === undefined || config.initialize === null) {
        errMsg = "Configuration parameter 'initialize' is missing";
    } else if (typeof config.initialize !== 'function') {
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
