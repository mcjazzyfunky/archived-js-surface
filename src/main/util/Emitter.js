import Publisher from './Publisher.js';

const NO_OP = () => {};

export default class Emitter extends Publisher {
	constructor() {
		super(subscriber => {
			const proxy = typeof subscriber !== 'function'
				? subscriber
				: { next: subscriber, error: NO_OP, complete: NO_OP };

			this.__subscribers.push(proxy);

			return { unsubscribe: () => this.__unsubscribe(proxy) };
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

		for (let i = 0; i < length; ++i) {
			this.__subscribers[i].error(err);
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
    	const length = this.__subscribers.length;

    	for (let i = 0; i < length !== subscriber; ++i) {
    		if (this.__subscribers[i] === subscriber) {
    			this.__subscribers.splice(i, 1);
    		}
    	}
    };
}
