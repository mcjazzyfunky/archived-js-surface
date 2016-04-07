/* global document */

'use strict';

import ComponentConfig from './ComponentConfig.js';
import ComponentAdapter from './ComponentAdapter.js';
import PropertiesValidator from '../internal/PropertiesValidator.js';
import Publisher from './Publisher.js';


let activeAdapter = null;

export default class Component {
    /**
     * @ignore
     */
    constructor() {
        throw new Error(
            "[Component.constructor] Class Component is not instantiable");
    }

    static createElement(tag, props, ...children) {
        if (activeAdapter === null) {
            throw new Error(
                '[Component.createElement] No component adapter available');
        }

        return activeAdapter.createElement(tag, props, children);
    }

    static isElement(what) {
        if (activeAdapter === null) {
            throw new Error(
                '[Component.isElement] No component adapter available');
        }

        return activeAdapter.isElement(what);
    }

    static createFactory(spec) {
        if (spec === null || typeof spec !== 'object') {
            throw new TypeError(
                '[Component.createFactory] '
                + "First argument 'spec' must be an object");
        } else if (activeAdapter === null) {
            throw new Error(
                '[Component.createFactory] No component adapter available');
        }

        const
            ret = (initialProps, ...children) => {
                return ret.adaptedFactory(initialProps, children);
            },

            componentConfig = new ComponentConfig(spec),

            view = (propsPublisher, contentPublisher, context = null) => {
                if (!(propsPublisher instanceof Publisher)) {
                    throw new TypeError(
                        '[Component.createFactory] '
                        + "First argument 'propsPublisher' of local function "
                        + "'view' must be an instance of class Publisher");
                } else if (typeof context !== 'object') {
                    throw new TypeError(
                        '[Component.createFactory] '
                        + "Second argument 'context' of local function 'view' "
                        + 'must be an object');
                }

                return componentConfig.getView()(propsPublisher, contentPublisher, context);
            };

        ret.__componentConfig = componentConfig;
        ret.__propertiesValidator = new PropertiesValidator(componentConfig);

        ret.adaptedFactory = activeAdapter.createAdaptedFactory(
            componentConfig, view);

        Object.freeze(ret);
        return ret;
    }

    static isFactory(what) {
        return !!(what && what.__componentConfig);
    }

    static mount(content, targetNode) {
        if (typeof document !== 'object' || document === null
            || typeof document.getElementById !== 'function') {

            throw new Error(
                '[Component.mount] This function is only available '
                + 'in browser environment');
        } else if (activeAdapter === null) {
            throw new Error(
                '[Component.mount] No component adapter available');
        }

        let mountNode = null;

        if (typeof targetNode === 'string') {
            mountNode = document.getElementById(targetNode);
        } else if (targetNode
            && targetNode.firstChild !== undefined
            && typeof targetNode.appendChild === 'function'
            && typeof targetNode.removeChild === 'function') {

            mountNode = targetNode;
        }

        if (!mountNode) {
            throw new Error('[Component.mount] Invalid target node'
                + (typeof targetNode !== 'string' ? '' : ` '${targetNode}'`));
        }

        while (mountNode.firstChild) {
            mountNode.removeChild(mountNode.firstChild);
        }

        activeAdapter.mount(
            Component.isFactory(content) ? content() : content,
            mountNode);
    }

    static loadAdapter(adapter) {
        if (!(adapter instanceof ComponentAdapter)) {
            throw new TypeError(
                "[Component.loadAdapter] First argument 'adapter' must be "
                + 'an instance of class ComponentAdapter');
        } else if (activeAdapter !== null) {
            throw new Error(
                '[Component.loadAdapter] A component adapter has already been loaded. '
                + "It's not allowed to load another one.");
        }

        activeAdapter = adapter;
    }

    /**
     * @ignore
     */
    static toString() {
        return 'Component/class';
    }
}

