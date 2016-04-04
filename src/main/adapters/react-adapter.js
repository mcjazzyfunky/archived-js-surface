'use strict';

import {Component, ComponentAdapter, ComponentConfig, Processor, Publisher} from 'js-surface';

import React from 'react';
import ReactDOM from 'react-dom';

class ReactComponentAdapter extends ComponentAdapter {
    constructor(id) {
        super(id);
    }

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

    createAdaptedFactory(componentConfig, fnBehaviorAndCtxToView) {
        if (!(componentConfig instanceof ComponentConfig)) {
            throw new TypeError(
                '[ReactComponentAdapter.createAdaptedFactory] '
                + "First argument 'componentConfig' must be an instance "
                + 'of class ComponentConfig');
        } else if (typeof fnBehaviorAndCtxToView !== 'function') {
            throw new TypeError(
                '[ReactComponentAdapter.createAdapterFactory] '
                + "Second argument 'fnBehaviorAndCtxToView' must be a function");
        }

        const constructor = function (...args) {
            ReactAdapterComponent.call(this, componentConfig, fnBehaviorAndCtxToView, args);
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
    constructor(componentConfig, fnBehaviorAndCtxToView, superArgs) {
        if (!(componentConfig instanceof ComponentConfig)) {
            throw new TypeError(
                '[ReactAdapterComponent.constructor] '
                + "First argument 'componentConfig' must be an instance "
                + 'of class ComponentConfig');
        } else if (typeof fnBehaviorAndCtxToView !== 'function') {
            throw new TypeError(
                '[ReactAdapterComponent.constructor] '
                + "Second argument 'fnBehaviorAndCtxToView' must "
                + 'be a function');
        }

        super(...superArgs);

        this.__componentConfig = componentConfig;
        this.__contentToRender = null;
        this.__propsProcessor = new Processor();
        this.__viewSubscription = null;
        this.__mounted = false;

        this.__viewPublisher = fnBehaviorAndCtxToView(
            this.__propsProcessor.asPublisher(), this.context);

        if (!(this.__viewPublisher instanceof Publisher)) {
            throw new TypeError(
                '[ReactAdapter.constructor] '
                + "The invocation of second argument 'fnBehaviorAndCtxToView' "
                + 'must return an instance of class Publisher');
        }
    }

    componentWillMount() {
        const self = this;

        this.__viewSubscription = this.__viewPublisher.subscribe({
            next(value) {
                self.__contentToRender = value;

                if (self.__mounted) {
                    self.forceUpdate();
                }
            }
        });

        this.__propsProcessor.next(this.props);
        this.__mounted = true;
    }

    componentWillUnmount() {
        this.__mounted = false;
        this.__viewSubscription.unsubscribe();
        this.__viewSubscription = null;
    }

    componentWillReceiveProps(nextProps) {
        this.__propsProcessor.next(nextProps);
    }

    shouldComponentUpdate() {
        return false;
    }

    render() {
        if (!this.__contentToRender) {
            throw new Error(
                '[ReactComponentAdapter#render] Something went wrong - no content to render');
        }

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

Component.loadAdapter(new ReactComponentAdapter());
