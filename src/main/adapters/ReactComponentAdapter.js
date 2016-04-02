'use strict';

import ComponentAdapter from '../core/ComponentAdapter';
import ComponentConfig from '../core/ComponentConfig';

import Observable from '../util/Observable';
import Subject from '../util/Subject';

import React from 'react';
import ReactDOM from 'react-dom';

export default class ReactComponentAdapter extends ComponentAdapter {
    constructor(componentConfig) {
        if (!(componentConfig instanceof ComponentConfig)) {
            throw new TypeError(
                '[ReactComponentAdapter.constructor] '
                + "First argument 'componentConfig' must be an instance of "
                + 'class ComponentConfig');
        }

        this.__componentConfig = componentConfig;
    }

    createElement(tag, props, children) {
        if (tag === undefined || tag === null) {
            throw new TypeError(
                '[ReactComponentAdapter.createElement] '
                + "First argument 'tag' must not be empty");
        }

        return (tag && tag.adaptedFactory)
            ? tag.adaptedFactory(props, children)
            : React.createElement(tag, props, ...children);
    }

    isElement(what) {
        return React.isValidElement(what); // TODO - is this really correct???
    }

    createAdaptedFactory(componentConfig) {
        throw Error('[ComponentAdapter#isElement] Method not implemented/overridden');
    }

    mount(content, targetNode) {
        if (!React.isValidElement(content)) {
            throw new TypeError(
                '[ReactComponentAdapter.mount] '
                + "First argument 'content' has to be a valid element");
        }

        ReactDOM.render(content, targetNode);
    }

    /**
     * @ignore
     */
    toString() {
        return 'ReactComponentAdapter/instance';
    }

    /**
     * @ignore
     */
    static toString() {
        return 'ReactComponentAdapter/class';
    }
}


class ReactAdapterComponent extends React.Component {
    constructor(componentConfig, superArgs) {
        if (!(componentConfig instanceof ComponentConfig)) {
            throw new TypeError(
                '[ReactAdapterComponent.constructor] '
                + "First argument 'componentConfig' must be an instance "
                + 'of class ComponentConfig');
        }

        super(...superArgs);
        this.__componentConfig = componentConfig;

        componentConfig.validateProps(this.props);

        this.__behavior = new Subject();
        this.__contents = componentConfig.getView(this.__behavior.asObservable(), this.context);
        this.__contentsSubscription = null;
        this.__currentContent = null;

        if (this.__contents instanceof Observable) {
            throw new TypeError(
                '[ReactComponentAdapter.constructor] View function of '
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

