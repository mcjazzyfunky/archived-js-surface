'use strict';

import {Component, Publisher} from 'js-surface';
import {commonView} from 'js-surface-views';
import {Objects, Storage} from 'js-prelude';

const {createElement: dom} = Component;

class ComponentStorage extends Storage {
    get initialState() {
        return {
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

const SimpleDemo = Component.createFactory({
    typeName: 'SimpleDemo',

    view: commonView({
        createStorage() {
            return new ComponentStorage();
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

 //   view: behavior => {
        /*
        const contentPublisher = new Publisher(subscriber => {
            subscriber.next(dom('div', null, 'Juhuuuuuu'));
            return () => {};
        });
        */
/*
        const
            contentPublisher = new Publisher(subscriber => {
                subscriber.next(dom('span', null, 'Starting...'));

                const intervalId = setInterval(() => {
                    subscriber.next(dom('div', null, '' + new Date));
                }, 1000);

                return () => clearInterval(intervalId);
            });


        return contentPublisher;
    }
 */
});

Component.mount(
    SimpleDemo({onUpdate: event => console.log(event)}),
    'main-content');
