import prettifyConfigError from './prettifyConfigError.js';
import validateConfigParameters from './validateConfigParameters.js';
import validateComponentName from './validateComponentName.js';
import validatePropertiesConfig from './validatePropertiesConfig.js';
import validateFunctionConfig from './validateFunctionConfig.js';

const CONFIG_KEYS = new Set(['name', 'properties', 'initProcess']);

export default function validateConfigForFunctionalComponent(
	config, platformAdaption) {

	let err =
	    validateConfigParameters(config, key => CONFIG_KEYS.has(key))
		|| validateComponentName(config.name)
		|| validatePropertiesConfig(config)
		|| validateFunctionConfig(config, 'initProcess', true);


	if (err) {
		throw prettifyConfigError(err, config);
	}

	return err;
}
