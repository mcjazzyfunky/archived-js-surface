import createPropsAdjuster from './createPropsAdjuster.js';
import defineGeneralComponent from './defineGeneralComponent.js';
import validateConfigForStandardComponent from './validateConfigForStadardComponent.js';

export default function defineStandardComponent(config) {
	const err = validateConfigForStandardComponent(config);

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

	return defineGeneralComponent(adjustedConfig);
}
