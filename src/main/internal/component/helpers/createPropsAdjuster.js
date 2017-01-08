import warn from '../../util/warn.js';

export default function createPropsAdjuster(config) {
    let ret;

    const
    	propertiesConfig = config.properties,
    	componentName = config.name,
        validations = [],
        defaults = {};

    if (!propertiesConfig) {
    	ret = props => props;
    } else {
    	let hasDefaults = false;

        for (let key of  Object.keys(propertiesConfig)) {
            const
                type = propertiesConfig[key].type,
                constraint = propertiesConfig[key].constraint || null,
                defaultValue = propertiesConfig[key].defaultValue,
                getDefaultValue = propertiesConfig[key].getDefaultValue,

                defaultValueProvider = getDefaultValue
                	? getDefaultValue
                	: (defaultValue !== undefined ? () => defaultValue : null);

        	hasDefaults = hasDefaults || defaultValueProvider !== null;

            validations.push([
            	key,
            	type,
            	constraint,
            	defaultValueProvider]);

	       	if (getDefaultValue) {
	       		Object.defineProperty(defaults, key, {
	       			get: getDefaultValue
	       		});
	       	} else if (defaultValue !== undefined) {
           		defaults[key] = defaultValue;
	       	}

			ret = props	=> {
			    const adjustedProps = hasDefaults
			    	? Object.assign({}, defaults, props)
			    	: props,

					err = validateProps(adjustedProps, validations);

			    if (err) {
			    	const errMsg = "Error while validating props for "
			    		+  `'${componentName}': ${err.message}`;

			    	warn(errMsg);

			    	warn(`Negatively validated props for '${componentName}':`,
			    		props);

			    	throw new Error(errMsg);
			    }

			    return adjustedProps;
			};
        }
    }

    return ret;
}

function validateProps(props, validations) {
    let errMsg = null;

    const keysToBeChecked = new Set(Object.getOwnPropertyNames(props));

	// Depending on the platform they may be still available
	keysToBeChecked.delete('ref');
	keysToBeChecked.delete('key');

	// TODO: That's not really nice - make it better!
	// Ignore children
	keysToBeChecked.delete('children');

    try {
		for (let [propertyName, type, constraint, defaultValueProvider] of validations) {
			const defaultValue = defaultValueProvider
				? defaultValueProvider() : undefined;

			if (defaultValueProvider && defaultValue === undefined) {
				errMsg = 'Default prop provider must not return undefined';
				break;
			} else {
		        let prop = props[propertyName];

		        keysToBeChecked.delete(propertyName);

		        if (defaultValue !== undefined && prop === defaultValue) {
		        	// everything fine
		        } else if (defaultValue === undefined && props[propertyName] === undefined) {
		            errMsg = `Missing mandatory property '${propertyName}'`;
		        } else if (type === Array) {
		        	if (!Array.isArray(prop)) {
		        		errMsg = `The property '${propertyName}' must be an array`;
		        	}
		        } else if (type === Object) {
		        	if (prop === null || typeof prop !== 'object') {
		        		errMsg = `The property '${propertyName}' must be an object`;
		        	}
		        } else if (type === Date) {
		        	if (!(prop instanceof Date)) {
		        		errMsg = `The property '${propertyName}' must be a date`;
		        	}
		        } else if (prop != undefined && prop !== null
		            && typeof prop !== 'object' && prop.constructor !== type) {

		        	errMsg = `The property '${propertyName}' must be `
		        	    + type.name.toLowerCase();
		        } else if (constraint) {
		        	const checkResult =  constraint(prop);

		        	if (checkResult instanceof Error) {
		        		errMsg = `Invalid value for property '${propertyName}': `
		        			+ checkResult.message;
		        	} else if (checkResult && checkResult !== true) {
		        		errMsg = `Invalid value for property '${propertyName}'`;
		        	}
		        }
			}
		}

		if (!errMsg && keysToBeChecked.size > 0) {
		    const joined = Array.from(keysToBeChecked.values()).join(', ');

		    errMsg = `Illegal property key(s): ${joined}`;
		}
	} catch (err) {
		errMsg = String(err);
	}

	return errMsg ? new Error(errMsg) : null;
}
