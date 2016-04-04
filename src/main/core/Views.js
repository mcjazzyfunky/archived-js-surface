'use strict';

import {EventStream} from 'js-prelude';
import {Publisher} from 'js-surface';


export default class Views {
    constructor() {
        throw new Error(
            '[Views.constructor] Class Views is not instantiable');
    }

    simpleView(renderFunction) {
        if (typeof renderFunction !== 'function') {
            throw new TypeError(
                "[Views.simpleView] First argument 'renderFunction' "
                + 'must be a function');

            return (behavior, context) => {
                return new Publisher(subscriber => {
                    return behavior.subscribe({
                        next(props) {
                            subscriber.next(renderFunction(new Config(props), context));
                        },

                        error(err) {
                            subscriber.error(err);
                        },

                        complete() {
                            subscriber.complete();
                        }
                    });
                });
            };
        }
    }

    static toString() {
        return 'Views/class';
    }
}

function convertEventStreamToPublisher(eventStream) {
    return new Publisher(subscriber =>
        eventStream.subscribe(subscriber));
}

function convertPublisherToEventStream(publisher) {
    return new EventStream(subscriber =>
        publisher.subscribe(subscriber));
}
