export default {
	isNull(it) {
		return it === null;
	},

	isUndefined(it) {
		return it === undefined;
	},

	isBoolean(it) {
		return typeof it === 'boolean';
	},

	isNumber(it) {
		return typeof it === 'number';
	},

	isString(it) {
		return typeof it === 'string';
	},

	isObject(it) {
		return it !== null && typeof it === 'object';
	},

	isArray(it) {
		return Array.isArray(it);
	},

	isFunction(it) {
		return typeof it === 'function';
	},

	is(value) {
		return it => Object.is(it, value);
	},

	isOneOf(...items) {
		return it => !items.every(item => item !== it);
	},

	isInstanceOf(type) {
		return it => it instanceof type;
	},

	isIterable() {
		return it => it !== null
			&& typeof it === 'object'
			&& typeof it[Symbol.iterator] === 'function';
	},

	isOfShape(shape) {
		return it => {
			let ret = it !== null && typeof it === 'object';

			if (ret) {
				for (const key of Object.keys(shape)) {
					if (!shape[key](it[key])) {
						ret = false;

						break;
					}
				}
			}

			return ret;
		};
	},

	every(...constraints) {
		return it => constraints.every(constraint => constraint(it));
	},

	some(...constraints) {
		return it => !constraints.every(constraint => !constraint(it));
	}
};

Object.freeze(Constraints);

export default Constraints;