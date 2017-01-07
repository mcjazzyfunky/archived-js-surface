import Constraints from '../../../api/Constraints.js';

import prettifyComponentConfigError
	from '../helpers/prettifyComponentConfigError.js';

import shapeOfGeneralComponentConfig
	from '../config-shapes/shapeOfGeneralComponentConfig.js';


export default function validateFunctionComponentConfig(config) {
	const error =
		Constraints.hasShape(shapeOfGeneralComponentConfig)(config, '');

	return error !== null
		? prettifyComponentConfigError(error, config)
		: null;
}