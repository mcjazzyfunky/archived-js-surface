'use strict';

import {Content, ComponentAdapter, ComponentConfig, Emitter, Publisher} from 'js-surface';

import Inferno from 'inferno';
import {Component as InfernoComponent} from 'inferno-component';
import InfernoDOM from 'inferno-dom';


export default class InfernoComponentAdapter extends ComponentAdapter {
    constructor(id) {
        super(id);
    }

    createElement(tag, props, children) {
        // TODO: For performance reasons
        if (tag === undefined || tag === null) {
            throw new TypeError(
                '[InfernoComponentAdapter.createElement] '
                + "First argument 'tag' must not be undefined or null");
        }
        
        let ret;
        
        if (tag && tag.adaptedFactory) {
            const mappedChildren = [];
            
            for (let child of children) {
                if (child !== null && typeof child === 'object' && typeof child[Symbol.iterator] === 'function') {
                    for (let item of child) {
                        mappedChildren.push(item);            
                    }                  
                } else {
                    mappedChildren.push(child);
                }
            }
            
            ret = tag.adaptedFactory(props, mappedChildren);  
        } else {
            const args = [tag, props];
            
            for (let child of children) {
                if (child !== null && typeof child === 'object' && typeof child[Symbol.iterator] === 'function') {
                    for (let item of child) {
                        args.push(item);
                    } 
                } else {
                    args.push(child);
                }
            }
            
            ret = Inferno.createElement.apply(Inferno, args);
        }
        
        return ret; 
/*
        return (tag && tag.adaptedFactory)
            ? tag.adaptedFactory(props, children)
            : Inferno.createElement(tag, props, ...children);*/
    }

    isElement(what) {
        return what !== undefined && what !== null && what !== false;
    }

    createAdaptedFactory(componentConfig, view) {
        if (!(componentConfig instanceof ComponentConfig)) {
            throw new TypeError(
                '[InfernoComponentAdapter.createAdaptedFactory] '
                + "First argument 'componentConfig' must be an instance "
                + 'of class ComponentConfig');
        } else if (typeof view !== 'function') {
            throw new TypeError(
                '[InfernoComponentAdapter.createAdapterFactory] '
                + "Second argument 'view' must be a function");
        }

        const constructor = function (...args) {
            InfernoAdapterComponent.call(this, componentConfig, view, args);
        };

        constructor.prototype = Object.create(InfernoAdapterComponent.prototype);

        return (props, ...children) => this.createElement(constructor, props, children)
    }

    mount(content, targetNode) {
        if (!this.isElement(content)) {
            throw new TypeError(
                '[InfernoAdapter.mount] '
                + "First argument 'content' has to be a valid element");
        }

        InfernoDOM.render(content, targetNode);
    }

    /**
     * @ignore
     */
    toString() {
        return 'InfernoAdapter/instance';
    }

    /**
     * @ignore
     */
    static toString() {
        return 'InfernoAdapter/class';
    }
}

class InfernoAdapterComponent extends InfernoComponent {
    constructor(componentConfig, view, superArgs) {
        if (!(componentConfig instanceof ComponentConfig)) {
            throw new TypeError(
                '[InfernoAdapterComponent.constructor] '
                + "First argument 'componentConfig' must be an instance "
                + 'of class ComponentConfig');
        } else if (typeof view !== 'function') {
            throw new TypeError(
                '[InfernoAdapterComponent.constructor] '
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
                '[InfernoAdapter.constructor] '
                + "The invocation of second argument 'view' "
                + 'must return an instance of class Publisher');
        }
    }
    
    componentWillMount(params) {
        const self = this;

        this.__viewSubscription = this.__viewPublisher.subscribe({
            next(value) {
                self.__contentToRender = value;
                
                if (self.__mounted) {
                    self.forceUpdate();
                }
            }
        });

        const props = Object.assign({}, this.__componentConfig.getDefaultProps(), this.props);
        
        this.__propsEmitter.next(props);
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
        const props = Object.assign({}, this.__componentConfig.getDefaultProps(), nextProps);
        this.__propsEmitter.next(props);
    }
    
    componentDidUpdate() {
        const domNode = this._lastNode.dom;
        
        this.__contentEmitter.next(new Content(domNode));
    }

    shouldComponentUpdate() {
        return this.__contentToRender !== null;
    }

    render() {
        if (!this.__contentToRender) {
            throw new Error(
                '[InfernoComponentAdapter#render] Something went wrong - no content to render');
        }

        const ret = this.__contentToRender;
    
        setTimeout(() => {
            this.__contentToRender = null;
        },  0);
        
        return ret;
    }

    /**
     * @ignore
     */
    toString() {
        return 'InfernoAdapterComponent/class';
    }
}
