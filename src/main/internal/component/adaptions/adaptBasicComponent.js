import createPropsAdjuster from '../helpers/createPropsAdjuster.js';
import validateConfigForBasicComponent from '../validations/validateBasicComponentConfig.js';
import validateInitProcessResult from '../validations/validateInitProcessResult.js';

export default function adaptBasicComponentDefinition(config, platformAdaption) {
	const err = validateConfigForBasicComponent(config);

	if (err) {
		throw err;
	}

	const propsAdjuster = createPropsAdjuster(config);

	const adjustedConfig = {
		name: config.name,
		properties: config.properties,

		initProcess: onRender => {
			const
			    result = config.initProcess(onRender),
			    err = validateInitProcessResult(result, config);

			if (err) {
				throw err;
			}

			return {
				onProps(props) {
					result.onProps(propsAdjuster(props));
				},
				methods: result.methods || null
			};
		}
	};

	return platformAdaption(adjustedConfig);
}
