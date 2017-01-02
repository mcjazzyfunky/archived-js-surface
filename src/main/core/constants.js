const
	FORBIDDEN_METHOD_NAMES = new Set([
		'props', 'state', 'shouldComponentUpdated',
		'setState', 'updateState',
		'componentWillReceiveProps', 'forceUpdate',
		'componentWillMount', 'componentDidMount',
		'componentWillUpdate', 'componentDidUpdate',
		'constructor', 'refresh']),

	INJECTION_NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_-]*$/,
	METHOD_NAME_REGEX = /^[a-z][a-zA-Z0-9_-]*$/,
    PROP_NAME_REGEX = '/^[a-z][a-zA-Z0-9_-]*$/';

export {
	FORBIDDEN_METHOD_NAMES,
	INJECTION_NAME_REGEX,
	METHOD_NAME_REGEX,
	PROP_NAME_REGEX
};