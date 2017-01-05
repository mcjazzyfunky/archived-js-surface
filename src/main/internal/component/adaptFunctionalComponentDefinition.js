import createPropsAdjuster from './createPropsAdjuster';
import validateConfigForFunctionalComponent from './validateConfigForFunctionalComponent.js';

export default function adaptFunctionalComponentConfig(config, platformAdaption) {
	const err = validateConfigForFunctionalComponent(config);

	if (err) {
		throw err;
	}

	const propsAdjuster = createPropsAdjuster(config.name, config.properties);

	const improvedConfig = {
		name: config.name,
		properties: config.properties,
		render: props => config.render(propsAdjuster(props))
	};

	return platformAdaption(improvedConfig);
}
