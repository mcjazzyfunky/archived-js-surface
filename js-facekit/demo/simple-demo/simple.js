'use strict';

import {Component, Processor, Publisher} from 'js-surface';
import {Seq} from 'js-prelude';

const {createElement: dom} = Component;

const SimpleDemo = Component.createFactory({
    typeName: 'SimpleDemo',

    view: behavior => {
        /*
        const contentPublisher = new Publisher(subscriber => {
            subscriber.next(dom('div', null, 'Juhuuuuuu'));
            return () => {};
        });
        */

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
});

Component.mount(
    SimpleDemo,
    'main-content');
