'use strict';

import {Config, ConfigError} from 'js-prelude';
import {Component, Emitter} from 'js-surface';

export default class ExtComponent {
    constructor() {
        throw new TypeError(
            '[ExtComponent.constructor] Class is not instantiable '
            + '- use createFactory instead');
    }
    
    static createFactory(spec) {
        if (spec === null || typeof spec !== 'object') {
            throw new TypeError(
                "[ExtComponent] First argument 'spec' must be an object");
        }
        
        const
            config = new Config(spec),
            typeName = config.getString('typeName'),
            properties = config.getString('properties', null),
            view = buildView(config);
        
        return Component.createFactory({
            typeName,
            properties,
            view
        });
    }
}

function buildView(config) {
    const
        render = config.getFunction('render'),
        shouldUpdate = config.getFunction('shouldUpdate', null),
        onDidMount = config.getFunction('onDidMount', null),
        onWillUpdate = config.getFunction('onWillUpdate', null),
        onDidUpdate = config.getFunction('onDidUpdate', null),
        onWillUnmount = config.getFunction('onWillUnmount', null),
        onNextProps = config.getFunction('onNextProps', null),
        Controller = createControllerClass(config);
    
    return (propsPublisher, contentPublisher, ctx) => {
        let
            ctrl = null,
            prevProps = null,
            currentProps = null,
            prevState = null,
            currentState = null,
            currentContent = null,
            isFirstRendering = true;

        const
            vTreeEmitter = new Emitter(),
            
            doRendering = forced => {
                if (!forced && !isFirstRendering && shouldUpdate) {
                    if (!shouldUpdate(currentProps, prevProps, currentState, prevState)) {
                        return;
                    }
                } 
                
                if (!isFirstRendering && onWillUpdate) {
                    onWillUpdate({
                        type: 'willUpdate',
                        props: currentProps,
                        content: currentContent
                    });
                } 
                
                performRendering(
                    vTreeEmitter,
                    render,
                    currentProps,
                    ctrl,
                    ctx);
                
                if (isFirstRendering && onDidMount) {
                    setTimeout(() =>
                        onDidMount({
                            type: 'didMount',
                            props: currentProps,
                            content: currentContent,
                            ctrl,
                            ctx,
                            forceUpdate
                        }), 0);
                } else if (!isFirstRendering && onDidUpdate) {
                    setTimeout(() =>
                        onDidUpdate({
                            type: 'didUpdate',
                            props: currentProps,
                            content: currentContent,
                            ctrl,
                            ctx
                        }), 0);
                }
                
                isFirstRendering = false;
            },
            
            onUpdate = _ => {
                prevState = currentState;
                currentState = ctrl.state;
                doRendering();
            },
            
            onNotification = event => {
                performNotification(event, currentProps);
            },
            
            onCompleted = () => {
                if (!isFirstRendering && onWillUnmount) {
                    onWillUnmount({
                        type: 'willUnmount', 
                        props: currentProps,
                        content: currentContent,
                        ctrl,
                        ctx
                    });
                }
            },
            
            forceUpdate = () => {
                doRendering(true);
            };
            
        propsPublisher.subscribe({
            next(props) {
                prevProps = currentProps;
                currentProps = new Config(props);
                
                if (!isFirstRendering && onNextProps) {
                    onNextProps({
                        type: 'nextProps',
                        props: currentProps,
                        ctrl,
                        ctx
                    });
                }
                
                if (ctrl === null) {
                    ctrl = new Controller(currentProps, ctx, onUpdate, onNotification);
                    currentState = ctrl.state;
                }
                
                doRendering();
                isFirstRendering = false;
            },
        
            onError(err) {
                // This will actually never happen
                console.error(err);
                onCompleted();
            },
            
            onCompleted
        });
            
        contentPublisher.subscribe(content => {
            currentContent = content;
        });
        
        return vTreeEmitter.asPublisher();  
    };
}

function createControllerClass(config) {
    const
        initialState = config.getOfType('initialState', ['object', 'function'], null),
        getInitialState = typeof initialState === 'function' ? initialState : _ => initialState,
        transitionsConfig = config.getConfig('stateTransitions', null),
        tasksConfig = config.getConfig('tasks', null);
    
    if (initialState !== null && transitionsConfig === null) {
        throw new ConfigError("Missing property 'stateTransitions'");
    } else if (initialState === null && transitionsConfig !== null) {
        throw new ConfigError("Missing property 'initialState'");
    }
    
    const ret = function (props, ctx, onUpdate, onNotification) {
        this.__state = getInitialState(props);
        this.__ctx = ctx;
        this.__onUpdate = onUpdate;
        this.__onNotification = onNotification;
        
        Object.defineProperty(this, 'state', {
            get() {
                return this.__state;    
            }
        });
    };
    
    ret.prototype.notify = function (notification) {
        this.__onNotification(notification);
    };

    if (transitionsConfig) {
        for (let transitionName of transitionsConfig.keys()) {
            const transition = transitionsConfig.getFunction(transitionName);
            
            ret.prototype[transitionName] = function(...args) {
                this.__state = transition(...args)(this.__state);
                this.__onUpdate(this.__state);
            };
        }
    }
    
    
    if (tasksConfig) {
        for (let taskName of tasksConfig.keys()) {
            const task = tasksConfig.getFunction(taskName);
            
            ret.prototype[taskName] = function(...args) {
                return task(...args)(this, this.__ctx);    
            };
        }
    }
    
    return ret; 
}


function performRendering(vTreeEmitter, render, currentProps, ctrl, ctx) { 
    vTreeEmitter.next(render(currentProps, ctrl, ctx));    
}

function performNotification(event, props) {
    if (event === null || typeof event !== 'object') {
        throw new TypeError(
            "[Controller#notify] First argument 'event' must either be "
            + 'an object');
    } else if (typeof event.type !== 'string') {
        throw new TypeError(
            "[Controller#notify] First argument 'event' must have a "
            + "string property 'type'");
    }
    
    const
        callbackName =
            'on' + event.type[0].toUpperCase() + event.type.substr(1),

        callback = props.get(callbackName, null);
    
    if (typeof callback === 'function') {
        callback(event);
    }
}