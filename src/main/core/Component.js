/* global document */

'use strict';

import ComponentSpec from './ComponentConfig';
import ComponentAdapter from './ComponentAdapter';

const
    regexAdapterName = /^a-z[a-zA-Z0-9]*$/,
    adapterRegistry = new Map();

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
                '[Component.mount] No component adapter available');
        }

        activeAdapter.createElement(tag, props, children);
    }

    static isElement(what) {
        if (activeAdapter === null) {
            throw new Error(
                '[Component.mount] No component adapter available');
        }

        return activeAdapter.isElement(what);
    }

    static createFactory(spec) {
        if (spec === null || typeof spec !== 'object') {
            throw new TypeError(
                '[Component.createFactory] '
                + "First argument 'spec' must be an object");
        }

        const
            ret = (initialProps, ...children) => {
                return ret.adaptedFactory(initialProps, children);
            },

            componentCfg = new ComponentSpec(spec);

        ret.__componentCfg = componentCfg;
        ret.adaptedFactory = ComponentAdapter.createAdaptedFactory(componentCfg);

        Object.freeze(ret);
    }

    static isFactory(what) {
        return !!(what && what.__componentCfg && what.adaptedFactory);
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

    static registerAdapter(adapterName, adapter) {
        if (typeof adapterName !== 'string') {
            throw new TypeError(
                '[Component.registerAdapter] '
                + "First argument 'adapterName' must be a string");
        } else if (!adapterName.match(regexAdapterName)) {
            throw new Error(
                '[Component.registerAdapter] '
                + "First argument 'adapterName' must match the "
                + 'regular expression '
                + regexAdapterName);
        } else if (!(adapter instanceof ComponentAdapter)) {
            throw new TypeError(
                '[Component.registerAdapter] '
                + "Second argument 'adapter' must be an instance of class "
                + "'ComponentAdapter'");
        }

        adapterRegistry.set(adapterName, adapter);

        if (activeAdapter === null) {
            activeAdapter = adapter;
        }
    }

    static acitivateAdapter(adapterName) {
        if (typeof adapterName !== 'string') {
            throw new TypeError(
                '[Component.acitivateAdapter] '
                + "First argument 'adapterName' must be a string");
        } else if (!adapterName.match(regexAdapterName)) {
            throw new Error(
                '[Component.acitivateAdapter] '
                + "First argument 'adapterName' must match the "
                + 'the regular expression '
                + regexAdapterName);
        } else if (!adapterRegistry.has(adapterName)) {
            throw new Error(
                '[Component.activeComponentAdapter] '
                + 'No component adapter registered with name '
                + `'${adapterName}'`);
        }

        activeAdapter = adapterRegistry.get(adapterName);
    }

    /**
     * @ignore
     */
    static toString() {
        return 'Component/class';
    }
}
