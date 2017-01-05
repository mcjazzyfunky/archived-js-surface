export default function prettifyComponentConfigError(err, config) {
	let ret = null;

	if (!config || typeof config.name !== 'string') {
		ret = new Error('Invalid component configuration => '
			+ err.message);
	} else {
		ret = new Error('Invalid component configuration '
			+ `for '${config.name}' => ${err.message}`);
	}

	return ret;
}
