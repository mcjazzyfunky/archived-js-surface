/* global document */

'use strict';

import ComponentSpec from './ComponentConfig';
import ComponentAdapter from './ComponentAdapter';

const
    regexAdapterName = /^a-z[a-zA-Z0-9]*$/,
    adapterRegistry = new Map();

let activeAdapter = null;

export default class Surface {
    /**
     * @ignore
     */
    constructor() {
        throw new Error(
            "[Surface.constructor] Class Surface is not instantiable");
    }

    static createElement(tag, props, ...children) {
        if (activeAdapter === null) {
            throw new Error(
                '[Surface.mount] No component adapter available');
        }

        activeAdapter.createElement(tag, props, children);
    }

    static isElement(what) {
        if (activeAdapter === null) {
            throw new Error(
                '[Surface.mount] No component adapter available');
        }

        return activeAdapter.isElement(what);
    }

    static createComponentFactory(spec) {
        if (spec === null || typeof spec !== 'object') {
            throw new TypeError(
                '[Surface.createComponentFactory] '
                + "First argument 'spec' must be an object");
        }

        const
            ret = (initialProps, ...children) => {
                return ret.adaptedFactory(initialProps, children);
            },

            componentSpec = new ComponentSpec(spec);

        ret.__componentSpec = componentSpec;
        ret.adaptedFactory = ComponentAdapter.createAdaptedFactory(componentSpec);

        Object.freeze(ret);
    }

    static isComponentFactory(what) {
        return !!(what && what.__componentSpec && what.adaptedFactory);
    }

    static mount(content, targetNode) {
        if (typeof document !== 'object' || document === null
            || typeof document.getElementById !== 'function') {

            throw new Error(
                '[Surface.mount] This function is only available '
                + 'in browser environment');
        } else if (activeAdapter === null) {
            throw new Error(
                '[Surface.mount] No component adapter available');
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
            throw new Error('[Surface.mount] Invalid target node'
                  + (typeof targetNode !== 'string' ? '' : ` '${targetNode}'`));
        }

        while (mountNode.firstChild) {
            mountNode.removeChild(mountNode.firstChild);
        }

        activeAdapter.mount(
            Surface.isFactory(content) ? content() : content,
            mountNode);
    }

    static registerComponentAdapter(adapterName, adapter) {
        if (typeof adapterName !== 'string') {
            throw new TypeError(
                '[Surface.registerComponentAdapter] '
                + "First argument 'adapterName' must be a string");
        } else if (!adapterName.match(regexAdapterName)) {
            throw new Error(
                '[Surface.registerComponentAdapter] '
                + "First argument 'adapterName' must match the "
                + 'regular expression '
                + regexAdapterName);
        } else if (!(adapter instanceof ComponentAdapter)) {
            throw new TypeError(
                '[Surface.registerComponentAdapter] '
                + "Second argument 'adapter' must be an instance of class "
                + "'ComponentAdapter'");
        }

        adapterRegistry.set(adapterName, adapter);

        if (activeAdapter === null) {
            activeAdapter = adapter;
        }
    }

    static activateComponentAdapter(adapterName) {
        if (typeof adapterName !== 'string') {
            throw new TypeError(
                '[Surface.activateComponentAdapter] '
                + "First argument 'adapterName' must be a string");
        } else if (!adapterName.match(regexAdapterName)) {
            throw new Error(
                '[Surface.activateComponentAdapter] '
                + "First argument 'adapterName' must match the "
                + 'the regular expression '
                + regexAdapterName);
        } else if (!adapterRegistry.has(adapterName)) {
            throw new Error(
                '[Surface.activeComponentAdapter] '
                + 'No component adapter registered with name '
                + `'${adapterName}'`);
        }

        activeAdapter = adapterRegistry.get(adapterName);
    }

    /**
     * @ignore
     */
    static toString() {
        return 'Surface/class';
    }
}
