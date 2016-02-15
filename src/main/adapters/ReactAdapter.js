'use strict';

import Component from '../core/Component.js';
import ComponentMgr from '../core/ComponentMgr.js';
import ComponentAdapter from '../core/ComponentAdapter.js';
import Reader from 'js-prelude';
import React from 'react';
import ReactDOM from 'react-dom';
import {Observable, Subject} from 'rxjs';

export default class ReactAdapter extends ComponentAdapter {
    constructor() {
        super('React');
    }
    
    createElement(tagName, props, children) {
        return React.createElement(tagName, props, ...children); // TODO '...'
    }
    
    convertComponent(component, componentMgr = ComponentMgr.getGlobal()) {
        var ret;
        
        if (React.isValidElement(component)) {
            ret = component;
        } else if (component && component.isBlingComponent) {
            ret = this.createElement('span', null, component); // TODO - UGLY!!
        } else {
            if (!Component.isFactory(component)) {console.log(component)
                throw new TypeError(
                    '[ReactAdapter:convertComponent] '
                    + 'First argument must be a proper component factory created by '
                    + "'Component.createFactory'");
            } else if (!(componentMgr instanceof ComponentMgr)) {
                throw new TypeError(
                    '[ReactAdapter:convertComponentFactory] '
                    + 'Second argument must be a component manager');
            }
        
            const
                config = component.getConfig(),
                constructor = function () {ReactComponent.call(this, component,componentMgr)};
                
            constructor.displayName = config.typeId;
            constructor.prototype = ReactComponent.prototype;// new ReactComponent(componentFactory, componentMgr);
            ret = React.createFactory(constructor);
        }
        
        return ret;
    }

    mount(mainComponent, targetNode, adapterId, componentMgr = ComponentMgr.getGlobal()) { 
        ReactDOM.render(
                this.convertComponent(mainComponent, componentMgr),
                targetNode);
    }
}


class ReactComponent extends React.Component {
    constructor(componentFactory, componentMgr) {
       if (!Component.isFactory(componentFactory)) {
            throw new TypeError(
                '[ReactAdapter.constructor] '
                + 'First argument must be a proper component factory created by '
                + "'Component.createFactory'");
        } else if (!(componentMgr instanceof ComponentMgr)) {
            throw new TypeError(
                '[ReactComponent.constructor] '
                + 'Second argument must be a component manager');
        }        
        
        super();
        
        const config = componentFactory.getConfig();
        this.__needsToBeRendered = false;
        this.__propsSbj = new Subject();
        this.__subscriptionViewDisplay = null;
        this.__subscriptionViewEvents = null;
        
        const view = config.view(
            componentMgr.getUIBuilder('ReactAdapter'), // TODO
            this.__propsSbj);

        this.__viewDisplayObs = view.display;
        this.__viewEvents = view.events;

        this.__viewDisplayObs.subscribe(domTree => {
            this.__domTree = domTree;
            this.__needsToBeRendered = true;
            
            setTimeout(() => {
                if (this.__needsToBeRendered) {
                    this.forceUpdate();
                    //this.setState({});
                }
            }, 0);
        });
        
        if (this.__viewEvents !== null && typeof this.__viewEvents === 'object') {
            Object.keys(this.__viewEvents).forEach(key => {
                const obs = this.__viewEvents[key];
                
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
        //this.__domTree = null;
        this.__needsToBeRenderd = false;
        return ret;
    }
}
