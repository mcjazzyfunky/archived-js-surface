'use strict';

import Adapter from '../core/ComponentAdapter';
import ComponentConfig from '../core/ComponentConfig';

import Publisher from '../core/Publisher';
import Emitter from '../core/Emitter';

import React from 'react';
import ReactDOM from 'react-dom';

export default class ReactComponentAdapter extends Adapter {
    createElement(tag, props, children) {
        if (tag === undefined || tag === null) {
            throw new TypeError(
                '[ReactAdapter.createElement] '
                + "First argument 'tag' must not be empty");
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
        }

        super(...superArgs);

        this.__componentConfig = componentConfig;
        this.__contentToRender = null;

        this.__propsEmitter = propsEmitterFactory(content => {
            this.forceUpdate();
            this.__contentToRender = content;
        });

        if (!(this.__propsEmitter instanceof Emitter)) {
            throw new TypeError(
                '[ReactAdapter.constructor] Vigew function of '
                + `component of type '${this.__componentConfig.getTypeName()} `
                + 'must return an observable');
        }
    }

    componentWillMount() {
        this.__contentsSubscription = this.__contents.subscribe(content => {
            this.__currentContent = content;
            this.forceUpdate();
        });
    }

    componentWillUnmount() {
        this.__contentsSubscription.unsubscribe();
        this.__contentsSubscription = null;
    }

    componentWillReceiveProps(nextProps) {
        this.__componentConfig.validateProps(nextProps);
        this.__behavior.next(nextProps);
    }

    shouldComponentUpdate() {
        return false;
    }

    render() {
        const ret = this.__currentContent.virtualElement;
        this.__currentContent = null;

        return ret;
    }

    /**
     * @ignore
     */
    toString() {
        return 'ReactAdapterComponent/class';
    }
}

