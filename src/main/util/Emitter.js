import Publisher from './Publisher.js';

/*
import { EventSubject } from 'js-prelude';

EventSubject.prototype.asPublisher = function () {
	return this.asEventStream();
};

//export default EventSubject;
*/


const NO_OP = () => {};

export default class Emitter extends Publisher {
	constructor() {
		super(subscriber => {
			const
				proxy = typeof subscriber !== 'function'
					? subscriber
					: { next: subscriber, error: NO_OP, complete: NO_OP };

			this.__subscribers.push(proxy);

			return {
				unsubscribe: () => this.__unsubscribe(proxy)
			};
		});

		this.__subscribers = [];
		this.__publisherCounterpart = null;
	}

	next(event) {
		const length = this.__subscribers.length;

		try {
			for (let i = 0; i < length; ++i) {
				this.__subscribers[i].next(event);
			}
		} catch (err) {
			// TODO - remove sometimes
			console.error('[Emitter.next]', err);

			this.error(err);
		}
	}

	error(err) {
		const length = this.__subscribers.length;
console.log("xxxxxxxxxxxxxxxxxxxxxxxxxx", err)
		for (let i = 0; i < length; ++i) {
			try {
				this.__subscribers[i].error(err);
			} catch (err2) {
				console.err("yyyyyyyyyyyyyyyyyyyy",err);
				console.err(err2);
			}
		}

		this.__subscribers.length = 0;
	}

	complete() {
		const length = this.__subscribers.length;

		for (let i = 0; i < length; ++i) {
			this.__subscribers[i].complete();
		}

		this.__subscribers.length = 0;
	}

	asPublisher() {
		let ret = this.__publisherCounterpart;

		if (!ret) {
			ret = this.__publisherCounterpart =
			    new Publisher(subscriber => this.subscribe(subscriber));
		}

		return ret;
	}

    __unsubscribe(subscriber) {
    	let length = this.__subscribers.length;

    	for (let i = 0; i < length; ++i) {
    		if (this.__subscribers[i] === subscriber) {
    			this.__subscribers.splice(i, 1);
    			--length;
    			--i;
    		}
    	}
    };
}
