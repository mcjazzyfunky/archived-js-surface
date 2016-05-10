'use strict';

import {Surface} from 'js-surface';
import {SurfaceX} from 'js-surface-x';
import {Objects} from 'js-prelude';

const {createElement: dom} = Surface;

const CounterDemo = SurfaceX.createFactory({
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
                const prevCounter = ctrl.getState().counter;
                
                ctrl.updateCounter(n => n + delta);
                        
                ctrl.notify({
                    type: 'update',
                    counter: ctrl.getState().counter,
                    prevCounter: prevCounter
                });
            };
        }
    },

    render({props, state, ctrl}) {
        return (
            dom('div',
                null,
                dom('button', {
                    onClick: _ => ctrl.increaseCounter(-1) 
                },
                '-'),
                dom('label',
                    null,
                    state.counter,
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

    onDidMount(params) {
        console.log('onDidMount', params, params.node, params.content);
        // alert('onDidMount')
    },

    onWillUnmount(params) {
        console.log('onWillUnmount', params, params.content);
        // alert('onWillMount')
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

Surface.mount(
    CounterDemo({onUpdate: event => console.log(event)}),
    'main-content');
