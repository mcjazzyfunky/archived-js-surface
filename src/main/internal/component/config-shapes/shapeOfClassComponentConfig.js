import shapeOfPartialBaseConfig from './shapeOfPartialBaseConfig.js';
import Constraints from '../../../api/Constraints.js';

export default Object.assign({}, shapeOfPartialBaseConfig, {
	componentClass: Constraints.isFunction
});
