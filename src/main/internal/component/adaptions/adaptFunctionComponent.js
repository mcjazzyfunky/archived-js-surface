import createPropsAdjuster from '../helpers/createPropsAdjuster.js';

import validateFunctionComponentConfig
	from '../validations/validateFunctionComponentConfig.js';

export default function adaptFunctionComponent(config, platformAdaption) {
	const err = validateFunctionComponentConfig(config);

	if (err) {
		throw err;
	}

	const
	    propsAdjuster = createPropsAdjuster(config),

        adjustedConfig = {
		    name: config.name,
	        properties: config.properties,
		    render: props => config.render(propsAdjuster(props))
	    };

	return platformAdaption(adjustedConfig);
}
