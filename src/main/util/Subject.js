'use strict';

import Observable from './Observable';

export default class Subject extends Observable {
    constructor() {
        super(subscriber => {
            this.__subscribers.push(subscriber);

            return () => {
                const index = this.__subscribers.indexOf(subscriber);

                this.__subscribers.slice(index, index + 1);
            };
        });

        this.__subscribers = [];
        this.__eventStream = null;
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

    asObservable() {
        let ret = this.__eventStream;

        if (!ret) {
            ret = this.__eventStream = new Observable(subscriber => {
                return  this.subscribe(subscriber);
            });
        }

        return ret;
    }
}

