import { PROP_NAME_REGEX } from './componentConstants.js';
import validateKeyValues from '../util/validateKeyValues.js';
import validatePropertyConfig from './validatePropertyConfig.js';

export default function validatePropertiesConfig(propsConfig) {
   let err = validateKeyValues(propsConfig, key => key.match(PROP_NAME_REGEX));

   if (!err) {
    	for (let key of Object.getOwnPropertyNames(propsConfig)) {
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