import createPropsAdjuster from './createPropsAdjuster.js';
import { FORBIDDEN_METHOD_NAMES, METHOD_NAME_REGEX } from './componentConstants.js';
import validateConfigForGeneralComponent from './validateConfigForGeneralComponent.js';
import validateInitProcessResult from './validateInitProcessResult.js';

export default function adaptGeneralComponentDefinition(config, platformAdaption) {
	const err = validateConfigForGeneralComponent(config);

	if (err) {
		throw err;
	}

	const propsAdjuster = createPropsAdjuster(config.properties);

	const improvedConfig = {
		name: config.name,
		properties: config.properties,

		initProcess: onNextView => {
			const
			    result = config.initProcess(onNextView),
			    err = validateInitProcessResult(result);

			if (err) {
				throw new Error(
				    `Function 'initProcess' of general component '$[config.name}' `
				    `has returned an invalid value: ${err.message}`);
			}

			return {
				sendProps(props) {
					result.sendProps(propsAdjuster(props));
				},
				methods: result.methods || null
			};
		}
	};

	return platformAdaption(improvedConfig);
}
