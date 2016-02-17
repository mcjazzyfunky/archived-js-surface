'use strict';

import Component from '../core/Component.js';
import ComponentMgr from '../core/ComponentMgr.js';
import ComponentAdapter from '../core/ComponentAdapter.js';
import EventBinder from '../core/EventBinder.js';
import {Reader} from 'js-prelude';
import {Seq} from 'js-prelude';
import {Observable, Subject} from 'rxjs';

import React from 'react';
import ReactDOM from 'react-dom';

export default class ReactAdapter extends ComponentAdapter {
    constructor() {
        super('React');
    }
    
    convertComponentFactory(factory, componentMgr) {
        if (!Component.isFactory(factory)) {
            throw new TypeError(
                '[ReactAdapter:convertComponentFactory] '
                + 'First argument must be a component factory');
        } else if (!(componentMgr instanceof ComponentMgr)) {
            throw new TypeError(
                '[ReactAdapter:convertComponentFactory] '
                + 'Second argument must be a component manager');
        }

        const
            config = factory.getConfig(),
            reactAdapter = this,
            constructor = function () {
                ReactAdapterComponent.call(
                    this, factory, reactAdapter, componentMgr);
            };
            
        constructor.displayName = config.typeId;
        constructor.prototype = ReactAdapterComponent.prototype;
        return React.createFactory(constructor);
    }
    
    convertElement(element, componentMgr) {
        var ret;
       
        if (!(componentMgr instanceof ComponentMgr)) {
            throw new TypeError(
                '[ReactAdapter:convertElement] '
                + 'Second argument must be a component manager');
        } else if (element === undefined || element === null) {
            throw new TypeError(
                '[ReactAdapter:convertElement] '
                + 'First argument must not be empty');
        } else if (element instanceof Array) {
            if (element.length === 0) {
                throw new TypeError(
                    '[ReactAdapter:convertElement] '
                    + 'First argument must not be an empty array')
            } else if (typeof element[0] !== 'string') {
                throw new TypeError(
                    '[ReactAdapter:convertElement] '
                    + 'First item the first argument array must be a string');
            } else if (!element[0].startsWith('component:')) {
                const
                    tagName = element[0],
                    props = element[1],
                    mappedChildren = Seq.from(element)
                            .skip(2) 

                            .filter(element => element !== undefined
                                        && element !== null
                                        && element !== false)
                            
                            .map(element => element instanceof Array
                                    ? this.convertElement(element, componentMgr)
                                    : element);

                ret = React.createElement(tagName, props, ...mappedChildren);
            } else {
                const
                    factory = element.__componentFactory,
                    config = !factory || typeof factory.getConfig !== 'function'
                            ? null
                            : factory.getConfig();
                
                if (!config || config.typeId !== element[0].substring(10)) {
                    throw new TypeError('[ReactAdapter:convertElement] Invalid component node in virtual tree'); 
                }
                
                const
                    mappedFactory = this.convertComponentFactory(
                                            factory, componentMgr),

                    props = element[1] || null,

                    mappedChildren = Seq.from(element)
                            .skip(2)
                            
                            .filter(
                                element => element !== undefined
                                && element !== null
                                && element !== false)
                            
                            .map(element => element instanceof Array
                                    ? this.convertElement(element, componentMgr)
                                    : element);

                ret = mappedFactory(props, ...mappedChildren);
            }
        } else if (typeof element === 'object' && element.type || typeof element !== 'object') {
            ret = element;
        } else {
            throw new TypeError('[ReactAdapter:convertElement] '
                    + 'First argument must either be an array, a scalar value or a React element');
        }
        
        return ret;
    }

    mount(content, targetNode, componentMgr) {
        if (!content || !(content instanceof Array || content.type)) {
            throw new TypeError(
                '[ReactAdapter:mount] '
                + ' First argument must be a mountable element'); 
        } else if (!(componentMgr instanceof ComponentMgr)) {
            throw new TypeError(
                '[ReactAdapter:mount] '
                + 'Second argument must be a component manager');
        }
        
        ReactDOM.render(
                this.convertElement(content, componentMgr),
                targetNode);
    }
}


class ReactAdapterComponent extends React.Component{
    constructor(componentFactory, reactAdapter, componentMgr) {
       if (!Component.isFactory(componentFactory)) {
            throw new TypeError(
                '[ReactAdapterComponent.constructor] '
                + 'First argument must be a proper component factory created by '
                + "'Component.createFactory'");
        } else if (!(reactAdapter instanceof ReactAdapter)) {
            throw new TypeError(
                '[ReactAdapterComponent.constructor] '
                + 'Second argument must be a React adapter');
        } else if (!(componentMgr instanceof ComponentMgr)) {
            throw new TypeError(
                '[ReactAdapterComponent.constructor] '
                + 'Second argument must be a component manager');
        }        
        
        super();
        
        const
            config = componentFactory.getConfig(),
            eventBinder = new EventBinder();
            
        this.__needsToBeRendered = false;
        this.__propsSbj = new Subject();
        this.__subscriptionDisplay = null;

        const
            result = config.view({events: eventBinder, changes: this.__propsSbj}),
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
        this.__notifications = view.notifications;

        this.__displayObs.subscribe(display => {
            this.__domTree = reactAdapter.convertElement(display, componentMgr);
            this.__needsToBeRendered = true;
            
            setTimeout(() => {
                if (this.__needsToBeRendered) {
                    this.forceUpdate();
                }
            }, 0);
        });
        
        if (this.__notifications !== null && typeof this.__notifications === 'object') {
            Object.keys(this.__notifications).forEach(key => {
                const obs = this.__notifications[key];

                if (key.length > 0 && obs instanceof Observable) {
                    obs.subscribe(event => {console.log(event)
                        if (this.props) {
                            const
                                attr = 'on' + key[0].toUpperCase() + key.substr(1),
                                callback = this.props.get(attr);
                            console.log(3333, attr, callback)
                            if (typeof callback === 'function') {console.log(attr, event);
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
        //this.__domTree = null;
        this.__needsToBeRenderd = false;
        return ret;
    }
}
