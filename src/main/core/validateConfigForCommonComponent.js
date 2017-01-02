import prettifyConfigError from './prettifyConfigError.js';
import validateConfigParameters from './validateConfigParameters.js';
import validateComponentName from './validateComponentName.js';
import validatePropertiesConfig from './validatePropertiesConfig.js';
import validateFunctionConfig from './validateFunctionConfig.js';

const
    CONFIG_KEY_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/,
    METHOD_NAME_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/,

    CONFIG_BASE_KEYS = new Set(
    	['name', 'properties', 'render', 'publicMethods']);

export default function validateConfigForCommonComponent(
	config, platformAdaption) {

	let err =
	    validateConfigParameters(config, (key, value) =>
	        key.match(CONFIG_KEY_REGEX)
	    	&& (CONFIG_BASE_KEYS.has(key) || typeof value === 'function'))
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
