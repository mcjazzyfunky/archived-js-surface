export default function validateConfigParameters(obj, validator, mandatory) {
	let ret = null;

	const illegalKeys = [];

	if (obj === null || typeof obj !== 'object') {
		ret = new Error('Must be an object');
	} else {
	    for (let key in obj) {
	    	if (obj.hasOwnProperty(key) && !validator(key, obj[key])) {
				illegalKeys.push(key);
	    	}
	    }

	    if (illegalKeys.length === 1) {
	    	ret = new Error('Illegal parameter ' + illegalKeys[0]);
	    } else if (illegalKeys.length > 1) {
			const errMsg = 'Illegal parameters '
				+ illegalKeys.map(key => `' ${key}'`).join(', ');

	    	ret = new Error(errMsg);
	    }
	}

    if (!ret) {
    	const ownSymbols = Object.getOwnPropertySymbols(obj);

    	if (ownSymbols.length > 0) {
    		ret = new Error(
    			'Symbol keys are not allowed ('
    			+ ownSymbols.map(String).join(', ')
    			+ ')');
    	}
    }

    return ret;
}