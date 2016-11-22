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
        increaseCounter() {
            return state => Objects.transform(state, {
                counter: {$update: n => n + 1}
            });  
        },
        
        decreaseCounter() {
            return state => Objects.transform(state, {
                counter: {$update: n => n - 1}
            });
        }
    },
    
    onStateUpdate({state, oldState, ctrl}) {
        ctrl.notify({
            type: 'update',
            counter: state.counter,
            prevCounter: oldState.counter 
        });
    },

    render({props, state, ctrl}) {
        return (
            dom('div',
                null,
                dom('button', {
                    onClick: _ => ctrl.decreaseCounter() 
                },
                '-'),
                dom('label',
                    null,
                    state.counter,
                dom('button', {
                    onClick: _ => ctrl.increaseCounter() 
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
