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
        Controller = createControllerClass(config); 
    
    return (propsPublisher, contentPublisher, ctx) => {
        let
            ctrl = null,
            currentProps = null;

        const
            vTreeEmitter = new Emitter(),
            
            onUpdate = _ => {
                vTreeEmitter.next(render(currentProps, ctrl, ctx));
            },
            
            onNotification = event => {
                notify(event, currentProps);
            };
            
        propsPublisher.subscribe(props => {
            currentProps = new Config(props);
            
            if (ctrl === null) {
                ctrl = new Controller(currentProps, ctx, onUpdate, onNotification);
            }
            
            vTreeEmitter.next(render(currentProps, ctrl, ctx)); 
        });
        
        return vTreeEmitter.asPublisher();  
    };
}

function createControllerClass(config) {
    const
        initialState = config.getOfType('initialState', ['object', 'function'], null),
        getInitialState = typeof initialState === 'function' ? initialState : _ => initialState,
        transitionsConfig = config.getConfig('stateTransitions', null),
        tasksConfig = config.getConfig('tasks', null),
        shouldUpdate = config.getFunction('shouldUpdate', null),
        onWillMount = config.getFunction('onWillMount', null),
        onDidMount = config.getFunction('onDidMount', null),
        onWillUpdate = config.getFunction('onWillUpdate', null),
        onDidUpdate = config.getFunction('onDidUpdate', null),
        onNextProps = config.getFunction('onNextProps', null);
    
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
            }
        }
    }
    
    return ret; 
}

function notify(event, props) {
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