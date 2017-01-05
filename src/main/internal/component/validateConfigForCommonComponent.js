import { CONFIG_COMMON_COMPONENT_BASE_KEYS, METHOD_NAME_REGEX }
     from './constant.js';

import prettifyConfigError from './prettifyConfigError.js';
import validateConfigParameters from './validateConfigParameters.js';
import validateComponentName from './validateComponentName.js';
import validatePropertiesConfig from './validatePropertiesConfig.js';
import validateFunctionConfig from './validateFunctionConfig.js';

export default function validateConfigForCommonComponent(
	config, platformAdaption) {

	let err =
	    validateConfigParameters(config, (key, value) =>
	    	CONFIG_BASE_KEYS.has(key)
	    	|| (key.match(METHOD_NAME_REGEX)
	    	&& typeof value === 'function'))

	    || validatePublicMethods(config.publicMethods)
		|| validateComponentName(config.name)
		|| validatePropertiesConfig(config)
		|| validateFunctionConfig(config, 'render', true);


	if (err) {
		throw prettifyConfigError(err, config);
	}

	return err;
}

function validatePublicMethods(publicMethods) {
	let errMsg;

	if (publicMethods !== null && typeof publicMethods !== 'object') {
		errMsg = "Parameter 'publicMethods' must be an object";
	} else {
		for (let key of Object.getOwnPropertyNames(publicMethods)) {
			if (!key.matches(METHOD_NAME_REGEX)) {
				errMsg = "Illegal public method name '${key}'";
				break;
			}
		}
	}

	return errMsg
		? new Error(errMsg)
		: null;
}
