const
    registry = new Map(),
	defaultSetter = (key, value) => registry.set(key, value),
	defaultGetter = key => registry.get(key);

let injectorSetter = defaultSetter,
	injectorGetter = defaultGetter;

const InjectionRegistry = {
	get(key) {
		if (typeof key !== 'string') {
			throw new Error(
				"[InjectorRegistry.get] First parameter 'key' must be a string");
		}

		return injectorGetter(key);
	},

	set(key, value) {
		if (typeof key !== 'string') {
			throw new Error(
				"[InjectorRegistry.set] First parameter 'key' must be a string");
		} else if (!injectorSetter) {
			throw new Error(
				"[InjectorRegistry.set] Current configuration does not support this method");
		}

		injectorSetter(key, value);
	},

	configure({ get: getter, set: setter = null }) {
		if (typeof getter !== 'function') {
			throw new Error(
				"[InjectorRegistry] Configuration parameter 'get' must a function");
		} else if (setter !== null && typeof setter !== 'function') {
			throw new Error(
				"[InjectorRegistry.configure] Configuration parameter 'set' must a function or null");
		}

		injectorGetter = getter;
		injectorSetter = setter;
	},

	reset() {
		registry.clear();
		injectorGetter = defaultGetter;
		injectorSetter = defaultSetter;
	}
};

export default InjectionRegistry;
