import { CONFIG_GENERAL_FUNCTION_COMPONENT_KEYS } from './constants.js';
import prettifyConfigError from './prettifyConfigError.js';
import validateConfigParameters from './validateConfigParameters.js';
import validateComponentName from './validateComponentName.js';
import validatePropertiesConfig from './validatePropertiesConfig.js';
import validateFunctionConfig from './validateFunctionConfig.js';

export default function validateConfigForFunctionalComponent(
	config, platformAdaption) {

	let err =
	    validateConfigParameters(config,
	    	key => CONFIG_GENERAL_FUNCTION_COMPONENT_KEYS.has(key))

		|| validateComponentName(config.name)
		|| validatePropertiesConfig(config)
		|| validateFunctionConfig(config, 'initProcess', true);


	if (err) {
		throw prettifyConfigError(err, config);
	}

	return err;
}
