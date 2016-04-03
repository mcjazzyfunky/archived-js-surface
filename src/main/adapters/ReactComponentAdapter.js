'use strict';

import {ComponentAdapter, ComponentConfig, Emitter} from 'js-surface';

import React from 'react';
import ReactDOM from 'react-dom';

export default class ReactComponentAdapter extends ComponentAdapter {
    createElement(tag, props, children) {
        // TODO: For performance reasons
        if (tag === undefined || tag === null) {
            throw new TypeError(
                '[ReactComponentAdapter.createElement] '
                + "First argument 'tag' must not be undefined or null");
        }

        return (tag && tag.adaptedFactory)
            ? tag.adaptedFactory(props, children)
            : React.createElement(tag, props, ...children);
    }

    isElement(what) {
        return React.isValidElement(what); // TODO - is this really correct???
    }

    createAdaptedFactory(componentConfig, propsEmitterFactory) {
        if (!(componentConfig instanceof ComponentConfig)) {
            throw new TypeError(
                '[ReactComponentAdapter.createAdaptedFactory] '
                + "First argument 'componentConfig' must be an instance "
                + 'of class ComponentConfig');
        } else if (typeof propsEmitterFactory !== 'function') {
            throw new TypeError(
                '[ReactComponentAdapter.createAdapterFactory] '
                + "Second argument 'propsEmitterFactory' must be a function");
        }

        const constructor = function (...args) {
            ReactAdapterComponent.call(this, componentConfig, propsEmitterFactory, args);
        };

        constructor.displayName = componentConfig.getTypeName();
        constructor.defaultProps = componentConfig.getDefaultProps();
        constructor.prototype = Object.create(ReactAdapterComponent.prototype);

        return React.createFactory(constructor);
    }

    mount(content, targetNode) {
        if (!React.isValidElement(content)) {
            throw new TypeError(
                '[ReactAdapter.mount] '
                + "First argument 'content' has to be a valid element");
        }

        ReactDOM.render(content, targetNode);
    }

    /**
     * @ignore
     */
    toString() {
        return 'ReactAdapter/instance';
    }

    /**
     * @ignore
     */
    static toString() {
        return 'ReactAdapter/class';
    }
}


class ReactAdapterComponent extends React.Component {
    constructor(componentConfig, propsEmitterFactory, superArgs) {
        if (!(componentConfig instanceof ComponentConfig)) {
            throw new TypeError(
                '[ReactAdapterComponent.constructor] '
                + "First argument 'componentConfig' must be an instance "
                + 'of class ComponentConfig');
        } else if (!(propsEmitterFactory instanceof Emitter)) {
            throw new TypeError(
                '[ReactAdapterComponent.constructor] '
                + "Second argument 'propsEmitterFactory' must be an instance "
                + 'of class Emitter');
        }

        super(...superArgs);

        this.__componentConfig = componentConfig;
        this.__contentToRender = null;

        this.__propsEmitter = propsEmitterFactory(content => {
            this.__contentToRender = content;
            this.forceUpdate();
        });

        if (!(this.__propsEmitter instanceof Emitter)) {
            throw new TypeError(
                '[ReactAdapter.constructor] '
                + "The invocation of second argument 'propsEmitterFactory' "
                + 'must return an instance of class Emitter');
        }
    }

    componentWillMount() {
    }

    componentWillUnmount() {
        this.__propsEmitter.complete();
    }

    componentWillReceiveProps(nextProps) {
        this.__propsEmitter.next(nextProps);
    }

    shouldComponentUpdate() {
        return false;
    }

    render() {
        const ret = this.__contentToRender;
        this.__contentToRender = null;

        return ret;
    }

    /**
     * @ignore
     */
    toString() {
        return 'ReactAdapterComponent/class';
    }
}

