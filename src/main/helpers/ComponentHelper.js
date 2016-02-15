'use strict';

export default class ComponentHelper {
    static checkComponentFactoryConfig(config) {
        var ret;
        
        const typeIdRegex = /^[A-Z][a-zA-Z0-9]*$/;
        
        if (config === null || typeof config !== 'object') {
            ret = new TypeError('Component configuration has to of type {typeId : String, view: Function}');
        } else if (config.typeId === undefined  || config.typeId === null) {
            ret = new TypeError("Component configuration value 'typeId' is missing");
        } else if (typeof config.typeId !== 'string' || !config.typeId.match(typeIdRegex)) {
            ret = new TypeError(`Illegal value for 'typeID' (must match regex ${typeIdRegex})`);
        } else if (config.view === undefined || config.view === null) {
            ret = new TypeError("Component configuration value 'view' is missing");
        } else if (typeof config.view !== 'function') {
            ret = new TypeError("Component configuration value 'view' has to be a function");
        } else {
            ret = null;
        }
        
        return ret;
    }
}
