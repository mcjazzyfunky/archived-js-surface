export default function validateMandatoryFunctionConfig(config, key, isMandatory) {
	let errMsg = null;

	if (isMandatory && !config.hasOwnProperty(key)) {
		errMsg = `Missing configuration for function '${key}'`;
	} else {
		const func = config[key];

		if (func === undefined) {
			errMsg = `Configuration for function '${key}' must not be set to undefine`;
		} else if (typeof func !== 'function') {
			errMsg = `Invalid configuration for function '${key}'`;
		}
	}

	return errMsg
		? new Error(errMsg)
		: null;
}