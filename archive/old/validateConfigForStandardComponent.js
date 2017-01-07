import { CONFIG_COMMON_COMPONENT_BASE_KEYS, METHOD_NAME_REGEX }
     from './componentConstant.js';

import prettifyComponentConfigError from './prettifyComponentConfigError.js';
import validateKeyValues from '../util/validateKeyValues.js';
import validateComponentName from './validateComponentName.js';
import validatePropertiesConfig from './validatePropertiesConfig.js';
import validateFunctionConfig from './validateFunctionConfig.js';

export default function validateConfigForCommonComponent(
	config, platformAdaption) {

	let err =
	    validateKeyValues(config, (key, value) =>
	    	CONFIG_BASE_KEYS.has(key)
	    	|| (key.match(METHOD_NAME_REGEX)
	    	&& typeof value === 'function'))

	    || validatePublicMethods(config.publicMethods)
		|| validateComponentName(config.name)
		|| validatePropertiesConfig(config)
		|| validateFunctionConfig(config, 'render', true);


	if (err) {
		throw prettifyComponentConfigError(err, config);
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
