import createPropsAdjuster from './createPropsAdjuster.js';
import { FORBIDDEN_METHOD_NAMES, METHOD_NAME_REGEX } from './constants.js';
import validateConfigForGeneralComponent from './validateConfigForGeneralComponent.js';
import validateConfigParameters from './validateConfigParameters.js';

export default function adaptGeneralComponent(config, platformAdaption) {
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

function validateInitProcessResult(result) {
	let errMsg = null;

	if (result === null || typeof result !== 'object') {
		errMsg = 'Result must be an object';
	} else if (result.sendProps === undefined) {
		errMsg = "Undefined parameter 'sendProps'";
	} else if (typeof result.sendProps !== 'object') {
		errMsg = "Parameter 'sendProps' must be a function";
	} else if (result.hasOwnProperty('methods')) {
		if (result.methods === undefined) {
			errMsg = "Parameter 'methods' must not be set to undefined";
		} else if (result.methods !== null) {
			const err = validateConfigParameters(result, (key, value) =>
			    !FORBIDDEN_METHOD_NAMES.has(key)
				&& key.matches(METHOD_NAME_REGEX) && typeof value === 'function');

			if (err) {
				errMsg = err.message;
			}
		}
	}

	return errMsg
		? new Error(errMsg)
		: validateConfigParameters;
}
