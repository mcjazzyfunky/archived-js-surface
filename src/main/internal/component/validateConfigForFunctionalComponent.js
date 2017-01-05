import { CONFIG_FUNCTIONAL_COMPONENT_KEYS } from './componentConstants.js';
import prettifyComponentConfigError from './prettifyComponentConfigError.js';
import validateKeyValues from '../util/validateKeyValues.js';
import validateComponentName from './validateComponentName.js';
import validatePropertiesConfig from './validatePropertiesConfig.js';
import validateFunctionConfig from './validateFunctionConfig.js';
import warn from '../util/warn.js';

export default function validateConfigForFunctionalComponent(
	config, platformAdaption) {

	let err =
	    validateKeyValues(config,
	    	key => CONFIG_FUNCTIONAL_COMPONENT_KEYS.has(key))

		|| validateComponentName(config.name)
		|| validatePropertiesConfig(config.properties)
		|| validateFunctionConfig(config, 'render', true);

	if (err) {
		warn('Illegal component configuration:', config);
		throw prettifyComponentConfigError(err, config);
	}

	return err;
}
