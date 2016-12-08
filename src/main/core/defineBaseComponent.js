import warn from '../util/warn.js';

const
    COMPONENT_NAME_REGEX = /^[A-Z][a-zA-Z0-9]*$/,
    CONFIG_KEYS = new Set(['name', 'properties', 'initProcess', 'process']),
    PROPERTY_CONFIG_KEYS = new Set(['type', 'defaultValue']),
    INIT_PROCESS_RESULT_KEYS = new Set(['contents', 'methods']);

export default function defineBaseComponent(config, adapter) {
    const err = validateConfig(config);

    if (err) {
    	warn('[defineComponent] ' + err);
    	warn('[defineComponent] Invalid component confguration:', config);
        throw err;
    }

    // slightly improved config enriched with some additioal validation checks
    const
        { defaultValues, neededValidations } = determinePropertyConstraints(config.properties),
        hasDefaultValues = !neededValidations.every(validation => validation[2]),
        needsSpecialPropertyHandling = neededValidations.length > 0 || hasDefaultValues,
        improvedConfig = config.initProcess || needsSpecialPropertyHandling
        	? Object.assign({}, config)
        	: config;

    if (config.process && needsSpecialPropertyHandling) {
        improvedConfig.process = properties => {
        	const props = mapAndValidateProperties(
        		config.name, properties, neededValidations, defaultValues, hasDefaultValues, 'properies');

            return config.process(props);
        };
    } else if (config.initProcess) {
        improvedConfig.initProcess = inputs => {
	    	const improvedInputs = !needsSpecialPropertyHandling
	    		? inputs
	    		: inputs.map(properties =>
		        	mapAndValidateProperties(
		        		config.name, properties, neededValidations, defaultValues, hasDefaultValues, 'properies'));

            const
            	result = config.initProcess(improvedInputs),
            	err = validateInitializationResult(result);

            if (err) {
    			warn(err.message);
    			warn('Invalid intialization result:', result);
    			throw err;
            }

            return result;
        };
	}

    return adapter(improvedConfig);
}

function validateConfig(config) {
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
    } else if (!config.name.match(COMPONENT_NAME_REGEX)) {
        errMsg = "Configuration parameter 'name' must match with regex "
            + COMPONENT_NAME_REGEX + ` (given '${config.name}')`;
    } else if (config.process === undefined && config.initProcess === undefined) {
        errMsg = "Either configuration parameter 'process' "
            + "or parameter 'initProcess' must be set";
    } else if (config.process !== undefined && config.initProcess !== undefined) {
        errMsg = "Configuration parameters 'process' and 'initProcess' must not "
            + 'be set both';
    } else if (config.process !== undefined && typeof config.process !== 'function') {
        errMsg = "Configuration parameter 'process' must be a function";
    } else if (config.initProcess !== undefined && typeof config.initProcess !== 'function') {
        errMsg = "Configuration parameter 'inititialize' must be a function";
    }

    if (!errMsg) {
	    for (let key in config) {
	    	if (config.hasOwnProperty(key) && !CONFIG_KEYS.has(key)) {
				errMsg = `Illegal configuration key '${key}'`;
	    	}
	    }
	}

	if (!errMsg) {
		errMsg = validateKindsConfigs(config);
	}

    if (errMsg) {
        ret = new Error(improveErrorMsg(errMsg, config));
    }

    return ret;
}

function validateKindsConfigs(config) {
	let errMsg = null;

    for (let kind of ['properties' /* more to come in later versions */]) {
        if (config[kind] !== undefined
            && (config[kind] === null || typeof config[kind] !== 'object')) {

            errMsg = `Confguration parameter '${kind}' `
                   + "must either be be an object or undeclared";
        } else {
            const
                subConfig = config[kind] || {},
                propertyNames = Object.getOwnPropertyNames(subConfig);

            for (let propertyName of propertyNames) {
				const err = validatePropertyConfig(
					subConfig[propertyName], `${kind}.${propertyName}`);

                if (err) {
                	errMsg = err.message;
                    break;
                }
            }
        }

        if (errMsg) {
            break;
        }
   }

   return errMsg ? new Error(errMsg) : null;
}


function validatePropertyConfig(propertyConfig, path) {
	let errMsg = null;

    if (propertyConfig === undefined) {
       errMsg = `Configuration parameter '${path}' `
            + 'must no be set to undefined';
    } else if (propertyConfig === null) {
        errMsg = `Configuration parameter '${path}' `
            + 'must no be null';
    } else if (typeof propertyConfig !== 'object') {
        errMsg = `Configuration parameter '${path}' `
            + 'must be an object';
    } else if ([String, Number, Boolean, Array, Date, Object].indexOf(propertyConfig.type) === -1) {
        errMsg = `Configuration parameter '${path}.type' `
            + ' must either be String, Number, Boolean, Array, Date or Object';
    } else if (propertyConfig.hasOwnProperty('defaultValue')
    	&& propertyConfig.defaultValue === undefined) {

        errMsg = `Configuration parameter '${path}.defaultValue' `
            + ' must not be set to undefined';
    } else if (propertyConfig.hasOwnProperty('constraint')
        && typeof propertyConfig.defaultValue !== 'function') {

        errMsg = `Optinal configuration parameter '${path}.constraint' `
            + ' must be a function';
    } else {
	    for(let key in propertyConfig) {
	    	if (propertyConfig.hasOwnProperty(key) && !PROPERTY_CONFIG_KEYS.has(key)) {
	    		errMsg = `Illegal configuration key '${path}.${key}'`;
	    	}
	    }
    }

	return errMsg ? new Error(errMsg) : null;
}

function validateProperties(componentName, properties, neededValidations, kind) {
    let err = null;

    const keysToBeChecked = new Set(Object.keys(properties));

    // Depending on the platform they may be still available
    keysToBeChecked.delete('ref');
    keysToBeChecked.delete('key');

    // Ignore children
    keysToBeChecked.delete('children');

    for (let [propertyName, type, constraint, required] of neededValidations) {
        let value = properties[propertyName],
            errMsg = null;

        keysToBeChecked.delete(propertyName);

        if (required && properties[propertyName] === undefined) {
            errMsg = `Missing mandatory property '${propertyName}' for '${componentName}'`;
        } else if (type === Array) {
        	if (!Array.isArray(value)) {
        		errMsg = `Property '${propertyName}' must be an array`;
        	}
        } else if (type === Object) {
        	if (value === null || typeof value !== 'object') {
        		errMsg = `Property '${propertyName}' must be an object`;
        	}
        } else if (type === Date) {
        	if (!(value instanceof Date)) {
        		errMsg = `Property '${propertyName}' must be a date`;
        	}
        } else if (value === null
            || typeof value === 'object' || value.constructor !== type) {
console.log(propertyName, typeof value, value, String, value.constructor);
        	errMsg = `Property '${propertyName}' must be `
        	    + type.name.toLowerCase();
        } else if (constraint && !constraint(value)) {
        	errMsg = `Invalid value for property '${propertyName}'`;
        }

        // Just to make sure, we will try to normalize the error message a bit.
        if (errMsg) {
            errMsg = errMsg
                .replace(/^\s*(Error|Warning)\s*(:?)\s*/i, '')
                .replace(/(\s|\.)+$/, '')
                .replace(/`/g, "'")
                .replace(/^./, first => first.toUpperCase())
                .trim();

            err = new Error(errMsg);
            break;
        }
    }

    if (!err && keysToBeChecked.size > 0) {
        const joined = Array.from(keysToBeChecked.values()).join(', ');

        err = new Error(`Illegal property key(s) for '${componentName}': ` + joined);
    }

    return err;
}

function validateInitializationResult(result) {
	let ret = null;

    for (let key in result) {
    	if (result.hasOwnProperty(key) && !INIT_PROCESS_RESULT_KEYS.has(key)) {
			ret = `Illegal key '${key}' in initialization result`;
			break;
    	}
    }

	return ret;
}

function determinePropertyConstraints(properties) {
    const
        neededValidations = [],
        defaultValues = {};

    // will determine which properties have default or are required
    // and/or have type constraints
    if (properties) {
        const propertyNames = Object.getOwnPropertyNames(properties);

        for (let propertyName of propertyNames) {
            const
                type = properties[propertyName].type,
                constraint = properties[propertyName] || null,
                defaultValue = properties[propertyName].defaultValue,
                propertyRequired = defaultValue === undefined;

            neededValidations.push([
            	propertyName,
            	type,
            	constraint,
            	propertyRequired]);

	        if (!propertyRequired) {
            	defaultValues[propertyName] = defaultValue;
	        }
        }
    }

    return { neededValidations, defaultValues };
}

function mapAndValidateProperties(componentName, properties, neededValidations, defaultValues, hasDefaultValues, kind) {
   const err = validateProperties(componentName, properties, neededValidations, 'properties');

    if (err) {
    	warn(err.message);
    	warn(`Invalid properties for '${componentName}':`, properties);
    	throw err;
    }

    const props = hasDefaultValues
        ? Object.assign({}, defaultValues, properties)
        : properties;

	return props;
}

function improveErrorMsg(errMsg, config) {
    var fullErrMsg = errMsg;

    if (config !== null
        && typeof config === 'object'
        && typeof config.name === 'string'
        && config.name.match(COMPONENT_NAME_REGEX)) {

        fullErrMsg = `Component definition of '${config.name}': ${errMsg}`;
    }

    return fullErrMsg.trim();
}
