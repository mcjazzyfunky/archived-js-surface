'use strict';

import {Component} from 'js-surface';
import {Model, View} from 'js-surface-mvc';
import {Objects} from 'js-prelude';

const {createElement: dom} = Component;

class CounterModel extends Model {
    constructor() {
        super(null);
        
        this.state = {
            counter: 0
        };
    }

    getCounter() {
        return this.state.counter;
    }

    incrementCounter() {
        const oldCounter = this.state.counter;

        this.state = Objects.transform(this.state, {
            counter: {$update: n => n + 1}
        });

        this.notify({
            type: 'update',
            method: 'increment',
            counter: this.state.counter,
            oldCounter: oldCounter
        });
    }

    decrementCounter() {
        const oldCounter = this.state.counter;

        this.state = Objects.transform(this.state, {
            counter: {$update: n => n - 1}
        });

        this.notify({
            type: 'update',
            method: 'decrement',
            counter: this.state.counter,
            oldCounter: oldCounter
        });
    }
}

const CounterDemo = Component.createFactory({
    typeName: 'CounterDemo',

    view: View.define({
        getModel() {
            return new CounterModel();
        },

        render({props, ctrl}) {
            return (
                dom('div',
                    null,
                    dom('button', {
                        onClick: _ => ctrl.decrementCounter()
                    },
                    '-'),
                    dom('label',
                        null,
                        ctrl.getCounter()),
                    dom('button', {
                        onClick: _ => ctrl.incrementCounter()
                    },
                    '+'))
            );
        },

        onWillMount(params) {
            console.log('onWillMount', params);
            //alert('onWillMount')
        },

        onDidMount(params) {
            console.log('onDidMount', params, params.node, params.node.innerHTML);
            //alert('onDidMount')
        },

        onWillUnmount(params) {
            console.log('onWillUnmount', params, params.node);
            //alert('onWillMount')
        },

        onDidUnmount(params) {
            console.log('onDidUnmount', params, params.node);
            //alert('onDidMount')
        },

        onWillUpdate(params) {
            console.log('onWillUpdate', params, params.node.innerHTML);
            //alert('onWillUpdate')
        },

        onDidUpdate(params) {
            console.log('onDidUpdate', params, params.node.innerHTML);
            //alert('onDidUpdate')
        }
    })
});

Component.mount(
    CounterDemo({onUpdate: event => console.log(event)}),
    'main-content');
