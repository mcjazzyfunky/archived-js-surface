'use strict';

import {
    Config, ConfigError, EventStream, EventSubject, Storage
} from 'js-prelude';

import {Publisher} from 'js-surface';

export default function commonView(spec) {
    const
        typeOfSpec = typeof spec,
        specIsFunction = typeOfSpec === 'function',
        specIsObject = spec !== null && typeOfSpec === 'object';

    if (!specIsFunction && !specIsObject) {
        throw new TypeError(
            '[commonView] '
            + "First argument 'spec' must either be an object or a function");
    }

    return (
        specIsFunction
        ? commonViewFromFunction(spec)
        : commonViewFromObject(spec)
    );
}

function commonViewFromFunction(renderFunction) {
    return (behavior, context) => {
        return new Publisher(subscriber => {
            return behavior.subscribe({
                next(props) {
                    subscriber.next(renderFunction(new Config(props), context));
                },

                error(err) {
                    subscriber.error(err);
                },

                complete() {
                    subscriber.complete();
                }
            });
        });
    };
}

function commonViewFromObject(spec) {
    const
        config = new Config(spec),
        getStorage = config.getFunction('getStorage', null),
        render = config.getFunction('render');


    return (behavior, context) => {
        const storage = getStorage();

        if (!(storage instanceof Storage)) {
            throw new ConfigError(
                "[commonView] Configured function 'getStorage' must "
                + 'return an instance of class Storage');
        }

        const stream =
            publisherToEventStream(behavior)
                .combineLatest(
                    storage.modificationEvents
                        .startWith(null), (props, state) => {

                        return render({
                            props,
                            context,
                            store: storage.store,
                            ctrl: storage.control,
                            dispatch: storage.dispatcher
                        });
                    });

        return eventStreamToPublisher(stream);
    };
}

function eventStreamToPublisher(eventStream) {
    return new Publisher(subscriber => {
        return eventStream.subscribe(subscriber);
    })
}

function publisherToEventStream(publisher) {
    return new EventStream(subscriber => {
        return publisher.subscribe(subscriber);
    })
}

