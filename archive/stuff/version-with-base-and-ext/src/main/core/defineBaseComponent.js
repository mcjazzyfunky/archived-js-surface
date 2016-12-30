import warn from '../util/warn.js';

const
    COMPONENT_NAME_REGEX = /^[A-Z][a-zA-Z0-9]*$/,
    CONFIG_KEYS = new Set(['name', 'properties', 'initProcess', 'process']),

    VALUE_CONFIG_KEYS = new Set(
        ['type', 'constraint', 'defaultValue', 'defaultValueProvider']),

    INIT_PROCESS_RESULT_KEYS = new Set(['contents', 'methods']);

export default function defineBaseComponent(config, adapter) {
    const err = validateConfig(config);

    if (err) {
    	warn(err.toString());
    	warn('Invalid component configuration:', config);
        throw err;
    }

    // improved config enriched with some additioal validation checks
    const
        { validations, defaults } =
        	determineValidationsAndDefaults(config.properties),

        hasDefaults = !validations.every(validation => !validation[3]),
        needsSpecialPropertyHandling = validations.length > 0 || hasDefaults,

        improvedConfig = config.initProcess || needsSpecialPropertyHandling
        	? Object.assign({}, config)
        	: config;

    if (config.process && needsSpecialPropertyHandling) {
        improvedConfig.process = props =>
        	config.process(
        	    adjustValues(
        	 	    config.name, props, validations,
        	 	    defaults, hasDefaults, 'property'));

    } else if (config.initProcess) {
        improvedConfig.initProcess = propsStream => {
	    	const improvedPropsStream = !needsSpecialPropertyHandling
	    		? propsStream
	    		: propsStream.map(props =>
		            adjustValues(
		        		config.name, props, validations,
		        		defaults, hasDefaults, 'property')),

            	result = config.initProcess(improvedPropsStream),
            	err = validateInitProcessResult(result);

            if (err) {
    			warn(err.toString());
    			warn('Invalid process intialization result:', result);
    			throw err;
            }

            return result;
        };
	}

    return adapter(improvedConfig);
}

function validateConfig(config) {
    let ret = null,
    	errMsg = '';

    if (!config || typeof config !== 'object') {
        errMsg = 'Configuration must be an object';
    } else if (!config.hasOwnProperty('name')) {
    	errMsg = "Missing configuration parameter 'name'";
    } else if (typeof config.name !== 'string') {
        errMsg = "Configuration parameter 'name' must be a string";
    } else if (!config.name.match(COMPONENT_NAME_REGEX)) {
        errMsg = "Configuration parameter 'name' must match regex "
        	+ COMPONENT_NAME_REGEX;
    } else if (config.hasOwnProperty('process') && typeof config.process !== 'function') {
    	errMsg = "Configuration parameter 'process' must be a function";
    } else if (config.hasOwnProperty('initProcess') && typeof config.initProcess !== 'function') {
    	errMsg = "Configuration parameter 'initProcess' must be a function";
    } else if (!config.hasOwnProperty('process') && !config.hasOwnProperty('initProcess')) {
        errMsg = "Either configuration parameter 'process' "
            + "or configuration parameter 'initProcess' must be set";
    } else if (config.hasOwnProperty('process') && config.hasOwnProperty('initProcess')) {
        errMsg = "Configuration parameters 'process' and 'initProcess' must not "
            + 'be set both at once';
    }

    if (errMsg) {
        ret = new Error(errMsg);
    } else {
		ret = validateValueConfigs(config, 'properties'); // TODO - also validate 'provisions'

		if (!ret) {
			ret = validateKeys(config, CONFIG_KEYS);
		}
    }

	if (ret) {
		const
			errMsgPrefix =
				config !== null
				&& typeof config === 'object'
				&& config.name.match(COMPONENT_NAME_REGEX)

				? `Error at configuration of component '${config.name}': `
				: 'Error at configuration of component: ';

		ret = normalizeError(ret, errMsgPrefix);
	}

    return ret;
}

function validateKeys(obj, allowedKeys, path = null) {
	let ret = null;

    for (let key in obj) {
    	if (obj.hasOwnProperty(key) && !allowedKeys.has(key)) {
    		if (!path) {
				ret = new Error(`Illegal key '${key}'`);
    		} else {
    			ret = new Error(`Illegal key '${path}.${key}'`);
    		}

			break;
    	}
    }

    return ret;
}

function validateValueConfigs(config, subConfigKey) {
	let ret = null;

    const valueConfigs = config[subConfigKey];

    if (!valueConfigs || typeof valueConfigs !== 'object') {
        ret = new Error(`Configuration parameter '${subConfigKey}' `
            + 'must be an object');
    } else {
    	for (let valueKey in valueConfigs) {
    		if (valueConfigs.hasOwnProperty(valueKey)) {
    			ret = validateValueConfig(config, subConfigKey, valueKey);

    			if (ret) {
    				break;
    			}
    		}
    	}
    }

    return ret;
}

function validateValueConfig(config, subConfigKey, valueKey) {
	let ret = null,
		errMsg = null;

	const
		valueConfig = config[subConfigKey][valueKey],
		path = `${subConfigKey}.${valueKey}`;

    if (!valueConfig || typeof valueConfig !== 'object') {
        errMsg = `Configuration parameter '${path}' `
            + 'must be an object';
    } else if (typeof valueConfig.type !== 'function') {
        errMsg = `Configuration parameter '${path}.type' `
            + ' must be a constructor function';
    } else if (valueConfig.hasOwnProperty('defaultValue')
    	&& valueConfig.defaultValue === undefined) {

        errMsg = `Configuration parameter '${path}.defaultValue' `
            + ' must not be set to undefined';
    } else if (valueConfig.hasOwnProperty('defaultValue')
    	&& valueConfig.hasOwnProperty('defaultValueProvider')) {

        errMsg = `Configuration parameters '${path}.defaultValue' `
            + `and '${path}.defaultValueProvider' must not be set both `
            + 'at once';
    } else if (valueConfig.hasOwnProperty('defaultValueProvider')
    	&& typeof valueConfig.defaultValueProvider !== 'function') {

    	errMsg = `Configuration parameter '${path}.defaultValueProvider `
    	    + 'must be a function';
	} else if (valueConfig.hasOwnProperty('constraint')
        && typeof valueConfig.constraint !== 'function') {

        errMsg = `Configuration parameter '${path}.constraint' `
            + ' must be a function';
    }

    if (errMsg) {
    	ret = new Error(errMsg);
    } else {
    	ret = validateKeys(valueConfig, VALUE_CONFIG_KEYS, path);
    }

	return ret;
}

function validateValues(componentName, values, validations, kind) {
    let ret = null,
    	errMsg = '';

    const keysToBeChecked = new Set(Object.keys(values));

    if (kind === 'property') {
		// Depending on the platform they may be still available
    	keysToBeChecked.delete('ref');
    	keysToBeChecked.delete('key');

		// TODO: That's not really nice - make it better!
    	// Ignore children
    	keysToBeChecked.delete('children');
    }

   try {
    for (let [valueName, type, constraint, provider] of validations) {
    	const defaultValue = provider ? provider() : undefined;

    	if (provider && defaultValue === undefined) {
    		throw new Error('Default value provider must not return undefined');
    	}

        let value = values[valueName];

        keysToBeChecked.delete(valueName);

        if (defaultValue !== undefined && value === defaultValue) {
        	// everything fine
        } else if (defaultValue === undefined && values[valueName] === undefined) {
            errMsg = `Missing mandatory ${kind} '${valueName}' for '${componentName}'`;
        } else if (type === Array) {
        	if (!Array.isArray(value)) {
        		errMsg = `The ${kind} '${valueName}' must be an array`;
        	}
        } else if (type === Object) {
        	if (value === null || typeof value !== 'object') {
        		errMsg = `The ${kind} '${valueName}' must be an object`;
        	}
        } else if (type === Date) {
        	if (!(value instanceof Date)) {
        		errMsg = `The ${kind} '${valueName}' must be a date`;
        	}
        } else if (value != undefined && value !== null
            && typeof value !== 'object' && value.constructor !== type) {

        	errMsg = `The ${kind} '${valueName}' must be `
        	    + type.name.toLowerCase();
        } else if (constraint) {
        	const checkResult =  constraint(value);

        	if (checkResult instanceof Error) {
        		errMsg = `Invalid value for ${kind} '${valueName}': `
        			+ checkResult.message;
        	} else if (checkResult && checkResult !== true) {
        		errMsg = `Invalid value for ${kind} '${valueName}'`;
        	}
        }
    }

    if (!errMsg && keysToBeChecked.size > 0) {
        const joined = Array.from(keysToBeChecked.values()).join(', ');

        errMsg = `Illegal ${kind} key(s): ${joined}`;
    }

} catch (err) {
	console.error(err);
}

    if (errMsg) {
        ret = normalizeError(errMsg,
        	`Error with ${kind} of component '${componentName}': `);
    }

    return ret;
}

function validateInitProcessResult(result) {
	let ret = null;

    for (let key in result) {
    	if (result.hasOwnProperty(key) && !INIT_PROCESS_RESULT_KEYS.has(key)) {
			ret = `Illegal key '${key}' in process initialization result`;
			break;
    	}
    }

	return ret;
}

function determineValidationsAndDefaults(valueConfigs) {
    const
        validations = [],
        defaults = {};

    // will determine which properties have default or are required
    // and/or have type constraints
    if (valueConfigs) {
        const keys = Object.getOwnPropertyNames(valueConfigs);

        for (let key of keys) {
            const
                type = valueConfigs[key].type,
                constraint = valueConfigs[key].constraint || null,
                defaultValue = valueConfigs[key].defaultValue,
                defaultValueProvider = valueConfigs[key].defaultValueProvider,

                provider = defaultValueProvider
                	? defaultValueProvider
                	: (defaultValue !== undefined ? () => defaultValue : null);

            validations.push([
            	key,
            	type,
            	constraint,
            	provider]);

	       	if (defaultValueProvider) {
	       		Object.defineProperty(defaults, key, {
	       			get: defaultValueProvider
	       		});
	       	} else if (defaultValue !== undefined) {
           		defaults[key] = defaultValue;
	       	}
        }
    }

    return { validations, defaults };
}

function adjustValues(componentName, values, validations, defaults, hasDefaults, kind) {

    const adjustedValues = hasDefaults
    	? Object.assign({}, defaults, values)
    	: values,

		err = validateValues(
			componentName, adjustedValues, validations, kind);

    if (err) {
    	warn(err.message);
    	warn(`Invalid properties for '${componentName}':`, values);
    	throw err;
    }

	return adjustedValues;
}

function normalizeError(err, errMsgPrefix = '') {
    var fullErrMsg =
    	err.toString()
			.trim()
            .replace(/^(Error|Warning)\s*(:?)\s*/i, '')
            .replace(/^./, first => first.toUpperCase());

	if (errMsgPrefix) {
		fullErrMsg = `${errMsgPrefix} ${fullErrMsg}`.trim();
	}

    return new Error(fullErrMsg);
}
