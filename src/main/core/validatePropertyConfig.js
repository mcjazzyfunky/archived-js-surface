import { INJECTION_NAME_REGEX } from './constants.js';
import validateKeys from './validateKeys.js';

const
	PROP_CONFIG_KEYS = new Set(
		['type', 'defaultValue', 'getDefaultValue', 'constraint', 'inject']);

export default function validatePropertyConfig(propCfg) {
	let ret = null,
		errMsg = null;

    if (!propCfg || typeof propCfg !== 'object') {
        errMsg = 'Property configuration must be an object';
    } else if (typeof propCfg.type !== 'function') {
        errMsg = "Property configurtaion parameter 'type' must be a function";
    } else if (propCfg.hasOwnProperty('defaultValue')
    	&& propCfg.defaultValue === undefined) {

        errMsg = "Property configuration parameter 'defaultValue' "
            + ' must not be set to undefined';
    } else if (propCfg.hasOwnProperty('defaultValue')
    	&& propCfg.hasOwnProperty('getDefaultValue')) {

        errMsg = "Property configuratin parameters 'defaultValue' "
        	+ "and 'getDefaultValue' must not be set both together";
    } else if (propCfg.hasOwnProperty('getDefaultValue')
    	&& typeof propCfg.getDefaultValue !== 'function') {

    	errMsg = "Property configuration parameter 'getDefaultValue' "
    	    + 'must be a function';
	} else if (propCfg.hasOwnProperty('constraint')
        && typeof propCfg.constraint !== 'function') {

        errMsg = "Property configuration parameter 'constraint' "
            + ' must be a function';
    } else if (propCfg.hasOwnProperty('inject')
    	&& typeof propCfg.inject !== 'boolean'
    	&& typeof propCfg.inject !== 'string') {

    	errMsg = "Property configuration parameter 'inject' "
    		+ 'must either be boolean or a string';
    } else if (typeof propCfg.inject === 'string'
    	&& !propCfg.inject.match(INJECTION_NAME_REGEX)) {

    	errMsg = "Property configuration parameter 'inject' "
    		+ 'must match regex ' + INJECTION_NAME_REGEX;
    } else {
    	const err = validateKeys(propCfg, key => PROP_CONFIG_KEYS.has(key));

    	if (err) {
    		errMsg = err.message;
    	}
    }

    if (errMsg) {
    	ret = new Error(errMsg);
    }

	return ret;
}