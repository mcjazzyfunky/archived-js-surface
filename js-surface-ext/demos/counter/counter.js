'use strict';

import {Component} from 'js-surface';
import {ExtComponent} from 'js-surface-ext';
import {Objects} from 'js-prelude';

const {createElement: dom} = Component;

const CounterDemo = ExtComponent.createFactory({
    typeName: 'CounterDemo',
    
    initialState: {
        counter: 0
    },
    
    stateTransitions: {
        updateCounter(fn) {
            return state => Objects.transform(state, {
                counter: {$update: fn}
            });  
        },
    },
    
    tasks: {
        increaseCounter(delta) {
            return (ctrl, ctx) => {
                const prevCounter = ctrl.state.counter;
                
                ctrl.updateCounter(n => n + delta);
                        
                ctrl.notify({
                    type: 'update',
                    counter: ctrl.state.counter,
                    prevCounter: prevCounter
                });
            };
        }
    },

    render(props, ctrl, ctx) {
        return (
            dom('div',
                null,
                dom('button', {
                    onClick: _ => ctrl.increaseCounter(-1) 
                },
                '-'),
                dom('label',
                    null,
                    ctrl.state.counter,
                dom('button', {
                    onClick: _ => ctrl.increaseCounter(1) 
                },
                '+')))
        );
    },
    
    onNextProps(params) {
        console.log('onNextProps', params);
        // alert('onNextProps');
    },

    onWillMount(params) {
        console.log('onWillMount', params);
        // alert('onWillMount')
    },

    onDidMount(params) {
        console.log('onDidMount', params, params.node, params.content);
        // alert('onDidMount')
    },

    onWillUnmount(params) {
        console.log('onWillUnmount', params, params.content);
        // alert('onWillMount')
    },

    onDidUnmount(params) {
        console.log('onDidUnmount', params, params.content);
        // alert('onDidUnMount')
    },

    onWillUpdate(params) {
        console.log('onWillUpdate', params, params.content);
        // alert('onWillUpdate')
    },

    onDidUpdate(params) {
        console.log('onDidUpdate', params, params.content);
        // alert('onDidUpdate')
    }
});

Component.mount(
    CounterDemo({onUpdate: event => console.log(event)}),
    'main-content');
