'use strict';

const regexComponentTypeName = /^[A-Z][a-zA-Z0-9]$/;

export default class ComponentSpec {
    constructor(spec) {
        if (spec === null || typeof spec !== 'object') {
            throw new TypeError(
                '[ComponentSpec.constructor] '
                + "First argument 'spec' must be an object");
        }

        try {
            this.__spec = spec;
            this.__typeName = this.___readTypeNameParam();
            this.__properties = this.__readPropertiesParam();
            this.__propertyNames = new Set(Object.keys(this.__properties));

            this.__hasProperties =
                propertiesParam === true || this.__propertyNames.length > 0;

            this.__defaultProps = this.__readDefaultProps();
            this.__view = this.__readViewParam();
        } catch (err) {
            let message = '[ComponentSpec.constructor] ';

            if (this.__typeName) {
                message += 'Error in specification for component of type '
                    + `'${this.__typeName}'`;
            } else {
                message += 'Error in component specification';
            }

            message += ': ' + err;

            if (err instanceof TypeError) {
                throw new TypeError(message);
            } else {
                throw new Error(message);
            }
        }
    }

    getTypeName() {
        return this.__typeName;
    }

    getProperties() {
        return this.__properties;
    }

    getPropertyNames() {
        return this.__propertyNames;
    }

    hasProperties() {
        return this.__hasPropeties;
    }

    getDefaultProps() {
        return this.__defaultProps;
    }

    validateProps(props) {
        return props; // TODO: implement
    }

    ___readTypeNameParam() {
        const typeName = this.__spec.typeName;

        if (typeName === undefined) {
            throw new TypeError(
                + "Spec parameter 'typeName' is missing");
        } else if (typeof typeName !== 'string') {
            throw new TypeError(
                + "Spec parameter 'typeName' must be a string");
        } else if (!typeName.match(regexComponentTypeName)) {
            throw new Error(
                + "Spec parameter 'typeName' must match regular expression "
                + regexComponentTypeName);
        }

        return typeName;
    }

    __readPropertiesParam() {
        const
            propertiesParam = this.__spec.properties,
            typeOfPropertiesParam = typeof propertiesParam;

        if (typeOfPropertiesParam !== 'object' && typeOfPropertiesParam !== 'boolean') {
            throw new TypeError(
                "Spec parameter properties must either be an object, a boolean value or null");
        }

        const ret =
            propertiesParam === null || typeOfPropertiesParam === 'boolean'
            ? {}
            : propertiesParam;

        return ret;
    }

    __readDefaultProps() {
        return {}; // TODO: implement
    }

    __readViewParam() {
        const ret = this.__spec.view;

        if (ret === undefined) {
            throw new TypeError("Spec parameter 'view' is missing");
        } else if (typeof ret !== 'function') {
            throw new TypeError("Spec parameter 'view' must be a function");
        }

        return ret;
    }
}
