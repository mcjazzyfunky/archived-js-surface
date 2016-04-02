'use strict';

import ComponentAdapter from '../core/ComponentAdapter';
import ComponentSpec from '../core/ComponentSpec';

import React from 'react';
import ReactDOM from 'react-dom';

export default class ReactComponentAdapter extends ComponentAdapter {
    constructor(componentSpec) {
        if (!(componentSpec instanceof ComponentSpec)) {
            throw new TypeError(
                '[ReactComponentAdapter.constructor] '
                + "First argument 'componentSpec' must be an instance of "
                + 'class ComponentSpec');
        }

        this.__spec = componentSpec;
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

    createAdaptedFactory(componentSpec) {
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
    constructor(compentSpec, superArgs) {
        if (!(componentSpec instanceof ComponentSpec)) {
            throw new TypeError(
                '[ReactAdapterComponent.constructor] '
                + "First argument 'componentSpec' must be an instance "
                + 'of class ComponentSpec');
        }

        super(...superArgs);
        this.__componentSpec = componentSpec;

        componentSpec.validateProps(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.__componentSpec.validateProps(nextProps);
    }

    componentDidMount() {
    }

    render() {
    }

    /**
     * @ignore
     */
    toString() {
        return 'ReactAdapterComponent/class';
    }
}

