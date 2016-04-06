'use strict';

import ComponentConfig from '../core/ComponentConfig.js';

export default class PropertiesValidator {
    constructor(componentConfig) {
        if (!(componentConfig instanceof ComponentConfig)) {
            throw new TypeError(
                "[PropertiesValidator] First argument 'componentConfig' "
                + 'must be an instance of class ComponentConfig');
        }

        this.__componentConfig = componentConfig;
    }
    
    normalizeProperties(config) {
        const
            propsConfig = config.getConfig('properties', null),
            propNameRegex = /^[a-z][a-zA-Z0-9]*$/,
            propNames = propsConfig === null ? [] : propsConfig.keys(propNameRegex),
            ret = propNames.length === 0 ? null : {};
    
        for (let propName of propNames) {
            const
                propConfig = config.getConfig(['properties', propName]),
                defaultValue = propConfig.isDefined('defaultValue') ? propConfig.get('defaultValue') : undefined,
                type = validatePropertyTypeConfiguration(propConfig.get('type')),
                options = validatePropertyOptionsConfiguration(propConfig.getArray('options', null), type),
                rule = propConfig.getNonBlankString('rule', null),
                validation = propConfig.getFunction('validation', null);
    
            if (rule && !validation) {
                throw new ConfigError(`Missing 'validation' function for property '${propName}'`);
            } else if (validation && !rule) {
                throw new ConfigError(`Missing 'rule' string for property '${propName}'`);
            }
    
            ret[propName] = {
                type: type,
                options: options && options.length > 0 ? options : null,
                defaultValue: defaultValue,
                rule: rule,
                validation: validation
            }
        }
    
        return ret;
    }
    

    validateProperties(props) {
        let ret = '';

        const cfg = this.__componentConfig;

        const
            properties = cfg.getProperties(),
            propNames = cfg.getPropertyNames();

        // Check for unknown property keys
        for (let propName of propNames) {
            if (propName !== 'children') {
                if (typeof propName === 'symbol') {
                    ret = `Property key '${propName}' must not be a symbol`;
                } else if (!properties || !properties[propName]) {
                    ret = `Unknown property key '${propName}'`;
                }

                if (ret) {
                    break;
                }
            }
        }

        // Check for missing mandatory properties
        for (let propName of cfg.getMandatoryPropertyNames()) {
            if (!props.isDefined(propName)) {
                ret = `Property '${propName}' is missing`;
                break;
            }
        }

        if (!ret) {
            for (let propName of propNames) {
                if (propName !== 'children') {
                    const defaultValue = properties[propName].defaultValue;

                    let propValue;

                    try {
                        propValue = props.get(propName, defaultValue);
                    } catch (error) {
                        ret = error.message;
                        break;
                    }

                    ret = this.__checkProperty(propName, propValue, properties[propName]);

                    if (ret) {
                        break;
                    }
                }
            }
        }

        return ret;
    }

    __checkProperty(propName, propValue, propConfig) {
        let ret = null;

        if (typeof propName === 'symbol') {
            ret = `Property must not be a symbol (${propName}')`;
         } else if (propConfig === null && typeof propConfig !== 'object') {
            ret = `Component does not have a property '${propName}'`;
        }

        return ret;
    }
}

