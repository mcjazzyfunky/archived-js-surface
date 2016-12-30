import Publisher from './Publisher.js';

export default class Emitter extends Publisher {
	constructor() {
		super(subscriber => {
			this.__subscribers.push(subscriber);

			return {
				unsubscribe() {
					this.__unsubscribe(subscriber);
				}
			};
		});

		this.__subscribers = [];
		this.__publisherCounterpart = null;
	}

	next(event) {
		try {
			for (let subscriber of this.__subscribers) {
				subscriber.next(event);
			}
		} catch (err) {
			this.error(err);
		}
	}

	error(err) {
			// TODO - remove sometimes
			console.error('[Emitter.error]', err);

		for (let subscriber of this.__subscribers) {
			subscriber.error(err);
		}

		this.__subscribers.length = 0;
	}

	complete() {
		for (let subscriber of this.__subscribers) {
			subscriber.complete();
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
    }
}
