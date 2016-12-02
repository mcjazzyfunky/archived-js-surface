'use strict';

export default class Publisher {
    constructor(onSubscribe) {
        if (typeof onSubscribe !== 'function') {
            throw new TypeError(
                "[Publisher.constructor] First argument 'onSubscribe' must be a function");
        }

        this.__onSubscribe = onSubscribe;
    }

    subscribe(subscriber) {
        let unsubscribed = false;

        const
            unsubscribe = () => {
                if (!unsubscribed) {
                    unsubscribed = true;
                    subscriberProxy.complete();

                    if (resultIsFunction) {
                        result();
                    } else if (result) {
                        result.unsubscribe();
                    }
                }
            },

            subscriberProxy = createSubscriberProxy(subscriber, unsubscribe),
            result = this.__onSubscribe(subscriberProxy),
            resultIsFunction = typeof result === 'function';

        if (!resultIsFunction && (!result || typeof result.unsubscribe !== 'function')) {
            throw new TypeError(
                "[EventStream.subscribe] The 'onSubscribe' function used for te construction "
                + 'of the event stream must either return a function or a subscription');
        }

        return {
            unsubscribe
        };
    }

    filter(pred) {
        if (typeof pred !== 'function') {
            throw new TypeError("[EventStream#filter] First argument 'pred' must be a function");
        }

        return new Publisher(subscriber => {
            let
                idx = -1,

                subscription = this.subscribe({
                    next(value) {
                        if (pred(value, ++idx)) {
                            subscriber.next(value);
                        }
                    },

                    complete: () => subscriber.complete(),

                    error: err => subscriber.error(err)
                });

            return subscription;
        });
    }

    map(f) {
        if (typeof f !== 'function') {
            throw new TypeError("[EventStream#map] First argument 'f' must be a function");
        }

        return new Publisher(subscriber => {
            let idx = -1;

            const subscription = this.subscribe({
                next(value) {
                    subscriber.next(f(value, ++idx));
                },

                error: err => subscriber.error(err),

                complete: () => subscriber.complete()
            });

            return subscription;
        });
    }

    combineLatest(stream, fn) {
        return new Publisher(subscriber => {
            const
                unsubscribe = () => {
                    if (subscription1) {
                        subscription1.unsubscribe();
                    }

                    if (subscription2) {
                        subscription2.unsubscribe();
                    }

                    subscription1 = null;
                    subscription2 = null;
                };

            let
                value1 = null,
                value1IsSet = false,
                value2 = null,
                value2IsSet = false,

                subscription1 = this.subscribe({
                    next(value) {
                        value1 = value;
                        value1IsSet = true;

                        if (value2IsSet) {
                            subscriber.next(fn(value1, value2));
                        }
                    },

                    error(err) {
                        unsubscribe();
                        subscriber.error(err);
                    },

                    complete() {
                        subscription1 = null;

                        if (!subscription2) {
                            subscriber.complete();
                        }
                    }
                }),

                subscription2 = stream.subscribe({
                    next(value) {
                        value2 = value;
                        value2IsSet = true;

                        if (value1IsSet) {
                            subscriber.next(fn(value1, value2));
                        }
                    },

                    error(err) {
                        unsubscribe();
                        subscriber.error(err);
                    },

                    complete() {
                        subscription2 = null;

                        if (!subscription1) {
                            subscriber.complete();
                        }
                    }
                });

            return unsubscribe;
        });
    }

    scan(fn, seed = undefined) {
        if (typeof fn !== 'function') {
            throw new TypeError("[Publisher#scan] First argument 'fn' must be a function");
        }

        return new Publisher(subscriber => {
            let
                accumulator = null,
                idx = -1;

            return this.subscribe({
                next: value => {
                    if (++idx === 0) {
                        accumulator = seed === undefined ? value : fn(seed, value, 0);
                    } else {
                        accumulator = fn(accumulator, value, idx);
                    }

                    subscriber.next(accumulator);
                }
            });
        });
    }

    startWith(value) {
        return new Publisher(subscriber => {
            subscriber.next(value);

            return this.subscribe(subscriber);
        });
    }

    endWith(value) {
        return new Publisher(subscriber => {
            return this.subscribe({
                 next(event) {
                     subscriber.next(event);
                 },
                 error(err) {
                     subscriber.next(err);
                 },
                 complete() {
                     subscriber.next(value);
                     subscriber.complete();
                 }
            });
        });
    }
}

function createSubscriberProxy(subscriber, unsubscribe) {
    let
        onNext = null,
        onError = null,
        onComplete = null,
        done = false;

    if (typeof subscriber === 'function') {
       onNext = subscriber;
    } else if (subscriber) {
        if (typeof subscriber.next === 'function') {
            onNext = value => subscriber.next(value);
        }

        if (typeof subscriber.error === 'function') {
            onError = err => subscriber.error(err);
        }

        if (typeof subscriber.complete === 'function') {
            onComplete = () => subscriber.complete();
        }
    }

    return {
        next(value) {
            if (!done && onNext) {
                try {
                    onNext(value);
                } catch (err) {
                    if (onError) {
                        onError(err);
                    }

                    done = true;
                    unsubscribe();
                }
            }
        },

        error(err) {
            if (!done) {
                if (onError) {
                    onError(err);
                }

                done = true;
                unsubscribe();
            }
        },

        complete() {
            if (!done) {
                if (onComplete) {
                    onComplete();
                }

                done = true;
                unsubscribe();
            }
        },
    };
}




/*
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

    map(fn) {
        return new Publisher(subscriber =>
            this.subscribe({
                next: event => subscriber.next(fn(event)),
                error: err => subscriber.error(err),
                complete: () => subscriber.complete()
            }));
    }

    filter(fn) {
        return new Publisher(subscriber =>
            this.subscribe({
                next: event => {
                    if (fn(event)) {
                        subscriber.next(event);
                    }
                },
                error: err => subscriber.error(err),
                complete: () => subscriber.complete()
            }));
    }

    combineLatest(other, fn) {
        return new Publisher(subscriber => {
            let left = null,
                leftStarted = false,
                right = null,
                rightStarted,
                leftSubscription = null,
                rightSubscription = null;


            leftSubscription = this.subscribe({
                next(event) {
                    leftStarted = true;
                    left = event;

                    if (rightStarted) {
                        subscriber.next(fn(left, right));
                    }
                },
                error(err) {
                    rightSubscription.unsubscribe();
                    leftSubscription = rightSubscription = null;
                    subscriber.error(err);
                },
                complete() {
                    rightSubscription.unsubscribe();
                    subscriber.complete();
                }
            });

            rightSubscription = other.subscribe({
                next(event) {
                    rightStarted = true;
                    right = event;

                    if (leftStarted) {
                        subscriber.next(fn(left, right));
                    }
                },
                error(err) {
                    leftSubscription.unsubscribe();
                    subscriber.error(err);
                },
                complete() {
                    leftSubscription.unsubscribe();
                    subscriber.complete();
                }
            });

            return () => {
                leftSubscription.unsubscribe();
                rightSubscription.unsuscribe();
            };
        });
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
*/
