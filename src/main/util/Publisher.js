export default class Publisher {
	constructor(onSubscribe) {
		this.__onSubscribe = onSubscribe;
	}

	subscribe(subscriber) {
		return this.__onSubscribe(subscriber);
	}

    map(f) {
        return new Publisher(subscriber => {
            const subscription = this.subscribe({
                next(value) {
                    subscriber.next(f(value));
                },

                error: err => subscriber.error(err),

                complete: () => subscriber.complete()
            });

            return subscription;
        });
    }
}

