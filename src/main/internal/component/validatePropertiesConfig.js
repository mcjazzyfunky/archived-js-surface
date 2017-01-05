import { PROP_NAME_REGEX } from './constants.js';
import validateConfigParameters from './validateConfigParameters.js';
import validatePropertyConfig from './validatePropertyConfig';

export default function validatePropertiesConfig(propsConfig) {
   let err = validateConfigParameters(propsConfig, key => key.match(PROP_NAME_REGEX));

   if (!err) {
    	for (let key in Object.getOwnPropertyNames(propsConfig)) {
    		err = validatePropertyConfig(propsConfig[key]);

			if (err) {
				break;
			}
		}
    }

    return err
        ? new Error('Invalid properties configuration: '  + err.message)
        : null;
}