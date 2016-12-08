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
                	try {
                    	subscriber.next(f(value));
                	} catch (err) {
                		if (subscriber.error) {
                			subscriber.error(err);
                		}

                		subscription.unsubscribe();
                	}
                },

                error: err => {
                	if (subscriber.error) {
                		subscriber.error(err);
                	}
                },

                complete: () => {
                	if (subscriber.complete) {
                		subscriber.complete();
                	}
                }
            });

            return subscription;
        });
    }
}

