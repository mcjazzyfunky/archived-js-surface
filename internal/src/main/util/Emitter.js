'use strict';

import Publisher from './Publisher.js';

export default class Emitter extends Publisher {
    constructor() {
        super(subscriber => {
            this.__subscribers.push(subscriber);

            return () => {
                const index = this.__subscribers.indexOf(subscriber);

                this.__subscribers.slice(index, index + 1);
            };
        });

        this.__subscribers = [];
        this.__publisher = null;
    }

    next(event) {
        for (let subscriber of this.__subscribers) {
            subscriber.next(event);
        }
    }

    complete(event) {
        for (let subscriber of this.__subscribers) {
            subscriber.complete();
        }

        this.__subscribers = [];
    }

    error(error) {
        for (let subscriber of this.__subscribers) {
            subscriber.error(error);
        }

        this.__subscribers = [];
    }

    asPublisher() {
        let ret = this.__publisher;

        if (!ret) {
            ret = this.__publisher = new Publisher(subscriber => {
                return this.subscribe(subscriber);
            });
        }

        return ret;
    }
}

