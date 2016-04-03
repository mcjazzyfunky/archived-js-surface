'use strict';

import {Observable, Subject} from 'rxjs';
import {Config} from 'js-prelude';

import React from 'react';
import ReactDOM from 'react-dom';

export default class ReactAdapter {
    static createElement(tag, props, children) {
        if (tag === undefined || tag === null) {
            throw new TypeError("[ReactAdapter.createElement] First argument 'tag' must not be empty");
        }

        const ret = (tag && tag.adaptedFactory)
                ? tag.adaptedFactory(props, children)
                : React.createElement(tag, props, ...children);

        return ret;
    }

    static isElement(obj) {
        return React.isValidElement(obj); // TODO - is this really correct???
    }
    
    static mount(content, targetNode) {
        if (!React.isValidElement(content)) {
            throw new TypeError("[ReactAdapter.mount] First argument 'content' has to be a valid element");
        }

        ReactDOM.render(content, targetNode);
    }
    
    static createAdaptedFactory(adaptionParams) {
        if (!adaptionParams || typeof adaptionParams !== 'object') {
            console.error(
                "[ReactAdapter.createAdaptedFactory] Illegal value for first argument 'adaptionParams':", adaptionParams);

            throw new TypeError(
                "[ReactAdapter:createAdaptedFactory] First argument 'adaptionParams' must be an object");
        }

        const constructor = function (...args) {
            ReactAdapterComponent.call(this, adaptionParams, args);
        };

        constructor.displayName = adaptionParams.typeId;
        constructor.defaultProps = adaptionParams.defaultProps;
        
        constructor.prototype = Object.create(ReactAdapterComponent.prototype);
        return React.createFactory(constructor);
    }

    /**
     * @ignore
     */
    static toString() {
        return 'ReactComponentAdapter/class';
    }
};

class ReactAdapterComponent extends React.Component {
    constructor(adaptionParams, superArgs) {
       if (!adaptionParams || typeof adaptionParams !== 'object') {
            throw new TypeError(
                '[ReactAdapterComponent.constructor] '
                + "First argument 'adaptionParams' must be an object");
        }

        super(...superArgs);
        this.__adaptionParams = adaptionParams;

        if (!this.__adaptionParams.updateState) {
            this.state = null;
        } else if (typeof this.__adaptionParams.initialState === 'function') {
            this.state = this.__adaptionParams.initialState(this.props);
        } else {
            this.state = this.__adaptionParams.initialState;
        }

        this.props = this.__adaptionParams.validateAndMapProps(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.props = this.__adaptionParams.validateAndMapProps(nextProps);
    }
    
    componentDidMount() {
        const callback = this.__adaptionParams.onMount;

        if (typeof callback === 'function') {
            callback({
                state: this.state,
                domElement: ReactDOM.findDOMNode(this)
            })
        }
    }
    
    render() {
        if (!(this.props instanceof Config)) {
            this.props = this.__adaptionParams.validateAndMapProps(this.props);
        }

        const
            update = {}, // will be enhanced below

            stateTransitions =
                !this.__adaptionParams.updateState
                ? null
                : this.__adaptionParams.updateState({
                    state: this.state
                }),

            ctrl =
                !this.__adaptionParams.control
                ? {}
                : this.__adaptionParams.control({
                    props: this.props,
                    state: this.state,
                    update: update
                });

        if (stateTransitions) {
            for (let transitionName of Object.keys(stateTransitions)) {
                update[transitionName] = (...args) => {
                    return new Promise((resolve, reject) => {
                        try {
                            const newState = stateTransitions[transitionName](...args);
                            this.setState(newState);
                            resolve(newState);
                        } catch (err) {
                            reject(err);
                        }
                    });
                }
            }
        }

        return this.__adaptionParams.render({
            props: this.props,
            state: this.state,
            ctrl,
            update
        });
    }
    
    toString() {
        return 'ReactAdapterComponent/class';
    }
}


