'use strict';

import {Content, ComponentAdapter, ComponentConfig, Emitter, Publisher} from 'js-surface';

import React from 'react';
import ReactDOM from 'react-dom';

export default class ReactAdapter extends ComponentAdapter {
    constructor(id) {
        super(id);
    }

    createElement(tag, props, children) {
        // TODO: For performance reasons
        if (tag === undefined || tag === null) {
            throw new TypeError(
                '[ReactAdapter.createElement] '
                + "First argument 'tag' must not be undefined or null");
        }

        return (tag && tag.adaptedFactory)
            ? tag.adaptedFactory(props, children)
            : React.createElement(tag, props, ...children);
    }

    isElement(what) {
        return React.isValidElement(what); // TODO - is this really correct???
    }

    createAdaptedFactory(componentConfig, view) {
        if (!(componentConfig instanceof ComponentConfig)) {
            throw new TypeError(
                '[ReactAdapter.createAdaptedFactory] '
                + "First argument 'componentConfig' must be an instance "
                + 'of class ComponentConfig');
        } else if (typeof view !== 'function') {
            throw new TypeError(
                '[ReactAdapter.createAdapterFactory] '
                + "Second argument 'view' must be a function");
        }

        const constructor = function (...args) {
            ReactAdapterComponent.call(this, componentConfig, view, args);
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
    constructor(componentConfig, view, superArgs) {
        if (!(componentConfig instanceof ComponentConfig)) {
            throw new TypeError(
                '[ReactAdapterComponent.constructor] '
                + "First argument 'componentConfig' must be an instance "
                + 'of class ComponentConfig');
        } else if (typeof view !== 'function') {
            throw new TypeError(
                '[ReactAdapterComponent.constructor] '
                + "Second argument 'view' must be a function");
        }

        super(...superArgs);
        
        this.__componentConfig = componentConfig;
        this.__contentToRender = null;
        this.__propsEmitter = new Emitter();
        this.__contentEmitter = new Emitter();
        this.__viewSubscription = null;
        this.__mounted = false;

        this.__viewPublisher = view(
            this.__propsEmitter.asPublisher(),
            this.__contentEmitter.asPublisher(),
            this.context);

        if (!(this.__viewPublisher instanceof Publisher)) {
            throw new TypeError(
                '[ReactAdapter.constructor] '
                + "The invocation of second argument 'view' "
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

        this.__propsEmitter.next(this.props);
        this.__mounted = true;
    }
    
    componentDidMount() {
        this.componentDidUpdate(); 
    }

    componentWillUnmount() {
        this.__mounted = false;
        this.__viewSubscription.unsubscribe();
        this.__viewSubscription = null;
    }

    componentWillReceiveProps(nextProps) {
        this.__propsEmitter.next(nextProps);
    }
    
    componentDidUpdate() {
        const domNode = ReactDOM.findDOMNode(this);
        
        this.__contentEmitter.next(new Content(domNode));
    }

    shouldComponentUpdate() {
        return false;
    }

    render() {
        if (!this.__contentToRender) {
            throw new Error(
                '[ReactAdapter#render] Something went wrong - no content to render');
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
