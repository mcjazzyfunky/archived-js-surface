'use strict';

export default class Publisher {
    constructor(onSubscribe) {
        if (typeof onSubscribe !== 'function') {
            throw new TypeError(
                '[Publisher.constructor]' +
                + "First argument 'onSubscribe' must be a function");
        }

        this.__onSubscribe = onSubscribe;
    }

    subscribe(subscriber) {
        const
            subscriberType = typeof subscriber,
            subscriberIsFunction = subscriberType === 'function',
            subscriberIsObject = subscriberType === 'object';

        if (subscriber === null || (subscriberIsObject && subscriberIsFunction)) {
            throw new TypeError(
                '[Publisher.subscribe] '
                + "First argument 'subscriber' must either be a function "
                + 'or an object');
        } else if (subscriberIsObject) {
            if (subscriber.next !== undefined
                && typeof subscriber.next !== 'function') {

                throw new TypeError(
                    '[Publisher.subscribe] '
                    + "Subscriber property 'next' must either be a function "
                    + 'or undefined');
            } else if (subscriber.error !== undefined
                && typeof subscriber.error !== 'function') {

               throw new TypeError(
                    '[Publisher.subscribe] '
                    + "Subscriber property 'error' must either be a function "
                    + 'or undefined');
            } else if (subscriber.complete !== undefined
                && typeof subscriber.complete !== 'function') {

                throw new TypeError(
                    '[Emitter.subscribe] '
                    + "Subscriber property 'complete' must either be a function "
                    + 'or undefined');
            }
        }

        let unsubscribed = false;

        const
            subscriptionResult = this.__onSubscribe(
                normalizeSubscriber(subscriber)),

            subscriptionResultIsFunction =
                typeof subscriptionResult === 'function',

            unsubscribe = () => {
                if (!unsubscribed) {
                    unsubscribed = true;

                    if (!subscriberIsFunction && subscriber.complete) {
                        subscriber.complete();
                    }

                    if (subscriptionResultIsFunction) {
                        subscriptionResult();
                    } else {
                        subscriptionResult.unsubscribe();
                    }
                }
            };

        if (!subscriptionResultIsFunction
            && (!subscriptionResult || typeof subscriptionResult.unsubscribe !== 'function')) {

            throw new TypeError(
                "[Publisher.subscribe] The 'onSubscribe' function used for "
                + 'the construction of the observable object must either return '
                + "a function or a subscription object with 'unsubscribe' method");
        }

        return { unsubscribe };
    }
}

function normalizeSubscriber(subscriber) {
    const subscriberIsFunction = typeof subscriber === 'function';

    return {
        next(value) {
            if (subscriberIsFunction) {
                subscriber(value);
            } else if (subscriber.next) {
                subscriber.next(value);
            }
        },

        error(err) {
            if (!subscriberIsFunction && subscriber.error) {
                subscriber.error(err);
            }
        },

        complete() {
            if (!subscriberIsFunction && subscriber.complete) {
                subscriber.complete();
            }
        }
    };
}
