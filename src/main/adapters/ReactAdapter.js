'use strict';

import {Reader} from 'js-prelude';
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
                : React.createElement(tag, props, children);

        return ret;
    },
    
    mount(content, targetNode) {
        ReactDOM.render(content, targetNode);
    },
    
    convertComponentFactory(factory) {
        if (!isComponentFactory(factory)) {
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
        
        const constructor = function () {
            ReactAdapterComponent.call(this, factory);
        };

        constructor.displayName = config.typeId;
        constructor.prototype = Object.create(ReactAdapterComponent.prototype);
        return React.createFactory(constructor);
    }
};

class ReactAdapterComponent extends React.Component {
    constructor(componentFactory) {
       if (!isComponentFactory(componentFactory)) {
            throw new TypeError(
                '[ReactAdapterComponent.constructor] '
                + 'First argument must be a proper component factory created by '
                + "'Component.createFactory'");
        }        
        
        super();
        
        const
            config = componentFactory.meta.config,
            eventBinder = componentFactory.meta.Component.createEventBinder();
            
        this.__needsToBeRendered = false;
        this.__propsSbj = new Subject();
        this.__subscriptionDisplay = null;
        
        const 
            result = config.view(this.__propsSbj, eventBinder),
            view = result instanceof Observable ? {display: result} : result;

        if (!(view  && view.display instanceof Observable)) {
            console.error('[ReactAdapterComponent.constructor] '
                    + `Illegal view configuration of ${config.typeId}:`, view);
            
            throw new TypeError(
                    '[ReactAdapterComponent.constructor] '
                    + config.typeId
                    + ' view function did not return a proper value');
        }

        this.__displayObs = view.display;
        this.__events = view.events;

        this.__displayObs.subscribe(display => {
            this.__domTree = display;
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
                                callback = this.props.get(attr);
                            
                            if (typeof callback === 'function') {
                                callback(event);
                            }
                        }
                    });
                } 
            });
        }
        
        this.__hasInitialized = false;
    }
   
    componentWillUnmount() {
        //this.__subscription.unsubscribe();
    }
    
    componentWillReceiveProps(nextProps) {
        this.props = new Reader(nextProps);
        this.__propsSbj.next(this.props);
    }
    
    shouldComponentUpdate() {
        return this.__needsToBeRendered;
    }
    
    render() {
        if (!(this.props instanceof Reader)) {
            this.props = new Reader(this.props);
        }
        if (!this.__hasIniialized) {
            this.__hasIniialized = true;
            this.__propsSbj.next(this.props);
        }

        const ret = this.__domTree;
        this.__needsToBeRenderd = false;
        
        return ret;
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