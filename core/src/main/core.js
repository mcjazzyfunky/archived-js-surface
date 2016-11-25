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
    
    // TODO - add some return validation in enhanced init function
    enhancedConfig.initialize = (inputs) => {
        return config.initialize(inputs);
    };
    
    return definePlatformComponent(config);
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
