export default function validateMandatoryFunctionConfig(key, config, isMandatory) {
	let errMsg = null;

	if (isMandatory && !config.hasOwnProperty(key)) {
		errMsg = `Missing configuration for function '${key}'`;
	} else {
		const func = config.key;

		if (func === undefined) {
			errMsg = `Configuration for function '${key}' must not be set to undefine`;
		} else if (typeof renderFunction !== 'function') {
			errMsg = new Error("Invalid configuration for function '${key}'");
		}
	}

	return errMsg
		? new Error(errMsg)
		: null;
}