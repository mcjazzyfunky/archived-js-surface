import Constraints from '../../../api/Constraints.js';

import prettifyComponentConfigError
	from '../helpers/prettifyComponentConfigError.js';

import shapeOfFunctionComponentConfig
	from '../shapes/shapeOfFunctionComponentConfig.js';


export default function validateFunctionComponentConfig(config) {
	const error =
		Constraints.hasShape(shapeOfFunctionComponentConfig)(config, '');

	return error !== null
		? prettifyComponentConfigError(error, config)
		: null;
}