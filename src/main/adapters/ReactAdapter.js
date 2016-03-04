'use strict';

import {Observable, Subject } from 'rxjs';

import React from 'react';
import ReactDOM from 'react-dom';

const ReactAdapter = { 
    createElement(tag, props, children) {
        if (tag === undefined || tag === null) {
            throw new TypeError("[ReactAdapter.createElement] First argument 'tag' must not be empty");
        }

        const ret = (isComponentFactory(tag))
                ? tag.meta.convertedFactory(props, children)
                : React.createElement(tag, props, ...children);

        return ret;
    },
    
    isElement(obj) {
        return React.isValidElement(obj); // TODO - is this really correct???
    },
    
    mount(content, targetNode) {
        if (!React.isValidElement(content)) {
            throw new TypeError("[ReactAdapter.mount] First argument 'content' has to be a valid element");
        }

        ReactDOM.render(content, targetNode);
    },
    
    convertComponentFactory(factory) {
        if (!isComponentFactory(factory)) {
            console.error("[ReactAdapter.createElement] Illegal value for first argument 'factory':", factory);

            throw new TypeError(
                '[ReactAdapter:convertComponentFactory] '
                + "First argument 'factory' must be a component factory");
        }

        const
            config = factory.meta.config,
            typeId = config.typeId;
            
        if (typeof typeId !== 'string') {
            console.error('[ReactAdapter:convertComponentFactory] Illegal type id:', typeId);
            throw new TypeError('[ReactAdapter:convertComponentFactory] Illegal type id of component factory');
        }
        
        const constructor = function (...args) {
            ReactAdapterComponent.call(this, factory, args);
        };

        constructor.contentsName = config.typeId;
        constructor.defaultProps = config.defaultProps;
        constructor.prototype = Object.create(ReactAdapterComponent.prototype);
        return React.createFactory(constructor);
    },
    
    toString() {
        return 'ReactComponentAdapter/singleton';
    }
};

class ReactAdapterComponent extends React.Component {
    constructor(componentFactory, superArgs) {
       if (!isComponentFactory(componentFactory)) {
            throw new TypeError(
                '[ReactAdapterComponent.constructor] '
                + 'First argument must be a proper component factory created by '
                + "'Component.createFactory'");
        }        
        
        super(...superArgs);
        
        const
            config = componentFactory.meta.config,
            dependencies = {}; // TODO
        
        this.__config = componentFactory.meta.config;
        this.__needsToBeRendered = false;
        this.__propsSbj = new Subject();
        this.__subscriptionDisplay = null;
        
        
        
        const 
            result = componentFactory.meta.normalizedConfig.ui(this.__propsSbj, dependencies),
            ui = result instanceof Observable ? {contents: result} : result;

        if (!(ui  && ui.contents instanceof Observable)) {
            console.error('[ReactAdapterComponent.constructor] '
                    + `Illegal return value of function 'ui' of component factory '${config.typeid}':`, ui);
            
            throw new TypeError(
                    '[ReactAdapterComponent.constructor] '
                    + `Function 'ui' of component factory '${config.typeId}' did not return a proper value`);
        }

        this.__contentsObs = ui.contents;
        this.__events = ui.events;

        this.__contentsObs.subscribe(contents => {
            if (!React.isValidElement(contents)) {
                console.error('[ReactComponentAdapter] Invalid content:', contents);
                throw new TypeError('[ReactComponentAdapter] Content is not a valid react element');
            }
            
            this.__domTree = contents;
            this.__needsToBeRendered = true;
            
            setTimeout(() => {
                if (this.__needsToBeRendered) {
                    this.forceUpdate();
                }
            }, 0);
        });
        
        if (this.__events !== null && typeof this.__events === 'object') {
            Object.keys(this.__events).forEach(key => {
                const obs = this.__events[key];

                if (key.length > 0 && obs instanceof Observable) {
                    obs.subscribe(event => {
                        if (this.props) {
                            const
                                attr = 'on' + key[0].toUpperCase() + key.substr(1),
                                callback = this.props[attr];
                            
                            if (typeof callback === 'function') {
                                callback(event);
                            }
                        }
                    });
                } 
            });
        }
        
        this.componentWillReceiveProps(superArgs[0])
        this.__hasInitialized = false;
    }
    
    componentDidMount() {
        const callback = this.__config.onMount;

        if (typeof callback === 'function') {
            callback({
                domElement: ReactDOM.findDOMNode(this),
                config: this.__config
            })   
        }
    }
    
    componentWillReceiveProps(nextProps) {
        this.props = nextProps
        this.__propsSbj.next(this.props);
    }
    
    shouldComponentUpdate() {
        return this.__needsToBeRendered;
    }
    
    render() {
        if (!this.__domTree) {
            throw new Error('[ReactAdapterComponent:render] '
                + `Invalid contents behavior for components of type '${this.__config.typeId}'`);
        } else if (!this.__hasIniialized) {
            this.__hasIniialized = true;
            this.__propsSbj.next(this.props);
        }
        
        const ret = this.__domTree;
        this.__needsToBeRenderd = false;
        
        return ret;
    }
    
    toString() {
        return 'ReactAdapterComponent/class';
    }
}

export default ReactAdapter;


function isComponentFactory(value) {
    return typeof value === 'function'
        && value.meta
        && value.meta.config
        && value.meta.Component
        && typeof value.meta.Component.isFactory === 'function'
        && value.meta.Component.isFactory(value);
}