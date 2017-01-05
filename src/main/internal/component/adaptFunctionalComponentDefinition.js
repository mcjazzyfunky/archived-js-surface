import createPropsAdjuster from './createPropsAdjuster.js';
import validateConfigForFunctionalComponent from './validateConfigForFunctionalComponent.js';

export default function adaptFunctionalComponentDefinition(config, platformAdapter) {
	const err = validateConfigForFunctionalComponent(config);

	if (err) {
		throw err;
	}

	const
	    propsAdjuster = createPropsAdjuster(config.name, config.properties),

        adjustedConfig = {
		    name: config.name,
	        properties: config.properties,
		    render: props => config.render(propsAdjuster(props))
	    };

	return platformAdapter(adjustedConfig);
}
