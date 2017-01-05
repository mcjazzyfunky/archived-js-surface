import { CONFIG_FUNCTIONAL_COMPONENT_KEYS } from './constants.js';
import prettifyConfigError from './prettifyConfigError.js';
import validateConfigParameters from './validateConfigParameters.js';
import validateComponentName from './validateComponentName.js';
import validatePropertiesConfig from './validatePropertiesConfig.js';
import validateFunctionConfig from './validateFunctionConfig.js';

export default function validateConfigForFunctionalComponent(
	config, platformAdaption) {

	let err =
	    validateConfigParameters(config,
	    	key => CONFIG_FUNCTIONAL_COMPONENT_KEYS.has(key))

		|| validateComponentName(config.name)
		|| validatePropertiesConfig(config)
		|| validateFunctionConfig(config, 'render', true);

	if (!err) {
		for (let key of config.properties) {
			if (config.properties[key].hasOwnProperty('inject')) {
				err = new Error(`The configuration for property '${key}' `
					+ "must not contain parameter 'inject'");
			}
		}
	}

	if (err) {
		throw prettifyConfigError(err, config);
	}

	return err;
}