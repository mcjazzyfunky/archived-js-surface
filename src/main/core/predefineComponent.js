const
    COMPONENT_NAME_REGEX = /^[A-Z][a-zA-Z0-9]*$/,

	CONFIG_KEYS_WHEN_VIEW = new Set(['name', 'properties', 'view']),

	CONFIG_KEYS_WHEN_INIT_CONTROL =
		new Set(['name', 'properties', 'initControl']),

	FORBIDDEN_METHOD_NAMES = new Set([
		'props', 'state', 'shouldComponentUpdated',
		'setState', 'updateState',
		'componentWillReceiveProps', 'forceUpdate',
		'componentWillMount', 'componentDidMount',
		'componentWillUpdate', 'componentDidUpdate']),

    VALUE_CONFIG_KEYS =
        new Set(['type', 'constraint', 'defaultValue', 'getDefaultValue']);

export default function predefineComponent(config, definePlatformComponent) {
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

        improvedConfig = needsSpecialPropertyHandling
        	? Object.assign({}, config)
        	: config;



	if (config.view && needsSpecialPropertyHandling) {
	   improvedConfig.view = props =>
	    	config.view(
	      	    adjustValues(
	      	 	    config.name, props, validations,
	       	 	    defaults, hasDefaults, 'property'));
	} else if (!config.view && needsSpecialPropertyHandling) {
		const initControl = determineInitControlFunction(config);


	}

    if (needsSpecialPropertyHandling) {
    	if (config.view) {
    	} else {
    		const createPropsToViewChannel = determineInitControlFunction(config);

    		improvedConfig.initControl = onNewView => {
    			const ctrl = createPropsToViewChannel(onNewView);

    			return {
    				sendProps: props => {
    					ctrl.sendProps(adjustValues(
		      	 	    	config.name, props, validations,
		       	 	    	defaults, hasDefaults, 'property'));
    				},
    				methods: ctrl.methods
    			}
    		}
    	}
    }

    return definePlatformComponent(improvedConfig);
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
    } else if (!config.hasOwnProperty('view') && !config.hasOwnProperty('render')
    	&& !config.hasOwnProperty('initControl')) {
        errMsg = "None of the configuration parameters 'view', 'render' and "
            + "'initControl' has been set";
    } else if (config.hasOwnProperty('view') && config.hasOwnProperty('render')) {
        errMsg = "Configuration parameters 'view' and 'render' must not "
            + 'be set both at once';
    } else if (config.hasOwnProperty('view') && config.hasOwnProperty('initControl')) {
        errMsg = "Configuration parameters 'view' and 'initControl' must not "
            + 'be set both at once';
    } else if (config.hasOwnProperty('render') && config.hasOwnProperty('initControl')) {
        errMsg = "Configuration parameters 'render' and 'initControl' must not "
            + 'be set both at once';
    } else if (config.hasOwnProperty('publicMethods')) {
    	if (!Array.isArray(config.publicMethods)) {
    		errMsg = "Configuration parameter 'publicMethods' must be an array";
    	} else {
    		for (let methodName of Object.getOwnPropertyNames(config.publicMethods)) {
    			if (typeof config[methodName] !== 'function') {
	    			errMsg = `Method '${methodName}' in configuration parameter `
	    				+ "'publicMethods' is unknown";
    				break;
    			}
    		}
    	}
    }

	if (config.hasOwnProperty('view')) {
		const err = validateKeys(config, CONFIG_KEYS_WHEN_VIEW, null);

		if (err) {
			errMsg = err.message;
		}
	} else if (config.hasOwnProperty('initControl')) {
		const err = validateKeys(config, CONFIG_KEYS_WHEN_INIT_CONTROL, null);

		if (err) {
			errMsg = err.message;
		}
	} else {
	    for (let key of Object.getOwnPropertyNames(config)) {
	    	if (key !== 'names' && key !== 'properties' && key !== 'publicMethods') {
	    		if (typeof config[key] !== 'function') {
	    			errMsg = `Configuration parameter '${key}' must be a function`;
	    		} else if (FORBIDDEN_METHOD_NAMES.has(key) || key.substr(0, 3) === '__$') {
	    			errMsg = `Configuration parameter name '${key}' is invalid`;
	    		}

	    		if (errMsg) {
	    			break;
	    		}
	    	}
	    }
	}

    if (errMsg) {
        ret = new Error(errMsg);
    } else {
		ret = validateValueConfigs(config, 'properties'); // TODO - also validate 'provisions' in future (???)
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
    	&& valueConfig.hasOwnProperty('getDefaultValue')) {

        errMsg = `Configuration parameters '${path}.defaultValue' `
            + `and '${path}.getDefaultValue' must not be set both `
            + 'at once';
    } else if (valueConfig.hasOwnProperty('getDefaultValue')
    	&& typeof valueConfig.getDefaultValue !== 'function') {

    	errMsg = `Configuration parameter '${path}.getDefaultValue `
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
                getDefaultValue = valueConfigs[key].getDefaultValue,

                provider = getDefaultValue
                	? getDefaultValue
                	: (defaultValue !== undefined ? () => defaultValue : null);

            validations.push([
            	key,
            	type,
            	constraint,
            	provider]);

	       	if (getDefaultValue) {
	       		Object.defineProperty(defaults, key, {
	       			get: getDefaultValue
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


function determineInitControlFunction(config) {
	let ret = null;

	if (config.initControl) {
		ret = config.initControl;
	} else if (!config.view) {
		ret = onNewView => {
			const
				virtualComponent = new VirtualComponent(config, onNewView),
				methods = {};

			let initialized = false;

			if (config.publicMethods) {
				for (let key of config.publicMethods) {
					methods[key] = config[key].bind(virtualComponent);
				}
			}

			return {
				sendProps(props) {
					if (initialized) {
						virtualComponent.onNextProps(props);
					}

					// Sorry for that not-so-nice shortcut :-(
					virtualComponent.__$updatePropsAndState(props, virtualComponent.state);
					initialized = true;
				},
				methods
			};
		};
	}

	return ret;
}

function warn(...args) {
	if (typeof console === 'object' && console !== null && typeof console.error === 'function') {
		console.error(...args);
	}
}

class VirtualComponent {
	constructor(config, onNewView) {
		this.__$onNewView = onNewView;
		this.__$props = null;
		this.__$state = null;
		this.__$renderTimeoutID = null;

		for (let key of Object.keys(config)) {
			if (typeof config[key] === 'function') {
				this[key] = config[key].bind(this);
			}
		}
	}

	get props() {
		return this.__$props;
	}

	get state() {
		return this.__$state;
	}

	set state(newState) {
		this.__$updatePropsAndState(this.props, newState);
	}

	refresh() {
		this.__$refesh(true);
	}

	needsUpdate(nextProps, nextState) {
		return true;
	}

	onNextProps(nextProps) {
	}

	onWillMount() {
	}

	onDidMount() {
	}

	onWillUpdate(nextProps, nextState) {
	}

	onDidUpdate(prevProps, prevState) {
	}

	onWillUnmount() {
	}

	onDidUnmount() {
	}

	// --- protected methods ---------------------------------------------

	__$updatePropsAndState(nextProps, nextState) {
		const
			prevProps = this.props,
			prevState = this.state,
			needsUpdate = this.needsUpdate(nextProps, nextState);

		if (needsUpdate) {
			this.onWillUpdate(nextProps, nextState);
		}

		this.__props = nextProps;
		this.__state = nextState;

		if (needsUpdate) {
			this.__$refresh();

			setTimeout(() => {
				this.onDidUpdate(prevProps, prevState);
			}, 0)
		}
	}

	__$refresh(deferred = false) {
		if (!deferred) {
			if (this.__$renderTimeoutID) {
				clearTimeout(this.__$renderTimeoutID);
				this.__$renderTimeoutID = null;
			}

			this.__$onNewView(this.render());
		} else if (!this.__$renderTimeoutID) {
			this.__$renderTimeoutID = setTimeout(() => {
				this.__$renderTimeoutID = null;
				this.__$onNewView(this.render());
			}, 0);
		}
	}
}
