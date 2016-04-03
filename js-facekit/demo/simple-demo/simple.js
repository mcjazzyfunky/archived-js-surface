'use strict';

import {Component} from 'js-surface';
import {Seq} from 'js-prelude';

const {createElement: dom} = Component;

const SimpleDemo = Component.createFactory({
    typeName: 'SimpleDemo',

    view: behavior => {
        const contentPublisher = new Publisher(subscriber => {
            subscriber.next(dom('div', null, 'Juhuuuuuu'));
        });

        return contentPublisher;
    }
});
alert(1);
Component.mount(
    SimpleDemo,
    'main-content');
