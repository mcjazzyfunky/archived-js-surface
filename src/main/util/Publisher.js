import warn from './warn.js';

const NO_OP = () => {};

export default class Publisher {
	constructor(onSubscribe) {
		this.__onSubscribe = onSubscribe;
	}

	subscribe(subscriber) {
		if (!subscriber
			|| typeof subscriber !== 'object'
			|| typeof subscriber.next !== 'function'
			|| typeof subscriber.error !== 'function'
			|| typeof subscriber.complete !== 'function') {

			warn('[Publisher#subscribe] Invalid subscriber:', subscriber);
			throw new Error('Error: Invalid subscriber for publisher');
		}

		return this.__onSubscribe(subscriber);
	}

    map(fn) {
        return new Publisher(subscriber =>
            this.subscribe({
                next(value) {
                	try {
                    	subscriber.next(fn(value));
                	} catch (err) {console.error(err); // TODO - remove
                		if (subscriber.error) {
                			subscriber.error(err);
                		}
                	}
                },

                error(err) {console.error(err); // TODO - remove
               		subscriber.error(err);
                },

                complete() {
               		subscriber.complete();
                }
            }));
    }
}
