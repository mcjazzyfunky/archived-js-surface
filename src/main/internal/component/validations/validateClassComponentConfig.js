import Constraints from '../../../api/Constraints.js';

import prettifyComponentConfigError
	from '../helpers/prettifyComponentConfigError.js';

import shapeOfClassComponentConfig
	from '../shapes/shapeOfClassComponentConfig.js';


export default function validateFunctionComponentConfig(config) {
	const error =
		Constraints.hasShape(shapeOfClassComponentConfig)(config, '');

	return error !== null
		? prettifyComponentConfigError(error, config)
		: null;
}
