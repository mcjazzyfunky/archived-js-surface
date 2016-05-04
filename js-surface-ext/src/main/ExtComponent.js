'use strict';

import {Config, ConfigError, Functions} from 'js-prelude';
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
            properties = config.getObject('properties', null),
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
        onWillMount = config.getFunction('onWillMount', null),
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
            isFirstRendering = true,
            forceRendering = false,
            isDoingSomething = false;

        const
            vTreeEmitter = new Emitter(),
            
            doRendering = () => {
                
                if (!forceRendering && !isFirstRendering && shouldUpdate) {
                    if (!shouldUpdate({
                            props: currentProps,
                            prevProps,
                            state: currentState,
                            prevState})) {
                        return;
                    }
                } 
              
                forceRendering = false;
                
                if (isFirstRendering && onWillMount) {
                    onWillMount({
                        type: 'willMount',
                        props: currentProps,
                        prevProps,
                        state: currentState,
                        prevState,
                        ctrl
                    });
                } else if (!isFirstRendering && onWillUpdate) {
                    onWillUpdate({
                        type: 'willUpdate',
                        props: currentProps,
                        prevProps,
                        state: currentState,
                        prevState,
                        ctrl,
                        content: currentContent
                    });
                } 
                
                performRendering(
                    vTreeEmitter,
                    render,
                    currentProps,
                    prevProps,
                    currentState,
                    prevState,
                    ctrl,
                    ctx);
                
                if (isFirstRendering && onDidMount) {
                    setTimeout(() =>
                        onDidMount({
                            type: 'didMount',
                            props: currentProps,
                            prevProps,
                            state: currentState,
                            prevState,
                            content: currentContent,
                            ctrl,
                            ctx
                        }), 0);
                } else if (!isFirstRendering && onDidUpdate) {
                    setTimeout(() =>
                        onDidUpdate({
                            type: 'didUpdate',
                            props: currentProps,
                            prevProps,
                            state: currentState,
                            prevState,
                            content: currentContent,
                            ctrl,
                            ctx
                        }), 0);
                }
                
                isDoingSomething = false;
                isFirstRendering = false;
            },
            
            onUpdate = forced => {
                if (!forced) {
                    prevState = currentState;
                    currentState = ctrl.getState();
                }
                
                forceRendering = forceRendering || forced;
                
                if (!isDoingSomething) {
                    doRendering();
                }
            },
            
            onNotification = event => {
                performNotification(event, currentProps);
            },
            
            onCompleted = () => {
                if (!isFirstRendering && onWillUnmount) {
                    onWillUnmount({
                        type: 'willUnmount', 
                        props: currentProps,
                        prevProps,
                        state: currentState,
                        prevState,
                        content: currentContent,
                        ctrl,
                        ctx
                    });
                }
            };
            
            
        propsPublisher.subscribe({
            next(props) {
                prevProps = currentProps;
                currentProps = new Config(props);
                isDoingSomething = true;
                
                if (!isFirstRendering && onNextProps) {
                    onNextProps({
                        type: 'nextProps',
                        props: currentProps,
                        prevProps: prevProps,
                        state: currentState,
                        prevState: prevState,
                        ctrl,
                        ctx
                    });
                }
                
                if (ctrl === null) {
                    ctrl = new Controller(currentProps, ctx, onUpdate, onNotification);
                    currentState = ctrl.getState();
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
    };
    
    ret.prototype.getState = function () {
        return this.__state;
    };
    
    ret.prototype.notify = function (notification) {
        this.__onNotification(notification);
    };
    
    ret.prototype.forceUpdate = function () {
        this.__onUpdate(true);
    };

    if (transitionsConfig) {
        for (let transitionName of transitionsConfig.keys()) {
            const transition = transitionsConfig.getFunction(transitionName);
            
            ret.prototype[transitionName] = function(...args) {
                this.__state = transition(...args)(this.__state);
                this.__onUpdate(false);
            };
        }
    }
    
    
    if (tasksConfig) {
        for (let taskName of tasksConfig.keys()) {
            const task = tasksConfig.getFunction(taskName);
            
            ret.prototype[taskName] = function(...args) {
                let ret2;
                
                const fn = task(...args);
                
                if (typeof fn !== 'function') {
                    throw new TypeError('Task does not return a function');
                }
                
                if (!Functions.isGeneratorFunction(fn)) {
                    try {
                        ret2 = fn(this, this.__ctx);
    
                        if (!(ret2 instanceof Promise)) {
                            ret2 = Promise.resolve(ret2);
                        }
                    } catch (error) {
                        ret2 = Promise.reject(error);
                    }                
                } else {
                    const
                        handleNext = (generator, seed, resolve, reject) => {
                            try {
                                const
                                    {value, done} = generator.next(seed),
                                    valueIsPromise = value instanceof Promise;
        
                                if (done) {
                                    if (valueIsPromise) {
                                        value.then(resolve, reject);
                                    } else {
                                        resolve(value);
                                    }
                                } else {
                                    if (valueIsPromise) {
                                        value.then(result => handleNext(generator, result, resolve, reject), reject);
                                    } else {
                                        handleNext(generator, value, resolve, reject);
                                    }
                                }
                            } catch (err) {
                                generator.return();
                                reject(err);
                            }
                        };
        
                    return new Promise((resolve, reject) =>
                        handleNext(fn(this, this.__ctx), undefined, resolve, reject));
                }
                
                return ret2;
            };
        }
    }
    
    return ret; 
}


function performRendering(vTreeEmitter, render, props, prevProps, state, prevState, ctrl, ctx) { 
    vTreeEmitter.next(render({props, prevProps, state, prevState, ctrl, ctx}));    
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