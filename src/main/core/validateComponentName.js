const  COMPONENT_NAME_REGEX = /^[A-Z][a-zA-Z0-9]*$/;

export default function validateComponentName(name) {
	let errMsg = null;

	if (typeof name !== 'string') {
		errMsg = 'Component name must be a string';
	} else if (!name.match(COMPONENT_NAME_REGEX)) {
		errMsg = 'Component name must match regex ' + COMPONENT_NAME_REGEX;
	}

	return errMsg
		? new Error(errMsg)
		: null;
}
