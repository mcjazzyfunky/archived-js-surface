const
	FORBIDDEN_METHOD_NAMES = new Set([
		'props', 'state', 'shouldComponentUpdated',
		'setState', 'updateState',
		'componentWillReceiveProps', 'forceUpdate',
		'componentWillMount', 'componentDidMount',
		'componentWillUpdate', 'componentDidUpdate',
		'constructor', 'refresh']),

    CONFIG_COMMON_COMPONENT_BASE_KEYS =
    	new Set( ['name', 'properties', 'render', 'publicMethods']),

    CONFIG_FUNCTIONAL_COMPONENT_KEYS =
    	new Set(['name', 'properties', 'render']),

    CONFIG_GENERAL_FUNCTION_COMPONENT_KEYS =
    	new Set(['name', 'properties', 'initProcess']),

	INJECTION_NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_-]*$/,
	METHOD_NAME_REGEX = /^[a-z][a-zA-Z0-9_-]*$/,
    PROP_NAME_REGEX = '/^[a-z][a-zA-Z0-9_-]*$/';

export {
	CONFIG_COMMON_COMPONENT_BASE_KEYS,
	CONFIG_FUNCTIONAL_COMPONENT_KEYS,
	CONFIG_GENERAL_FUNCTION_COMPONENT_KEYS,
	FORBIDDEN_METHOD_NAMES,
	INJECTION_NAME_REGEX,
	METHOD_NAME_REGEX,
	PROP_NAME_REGEX
};
