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
        createStorage = config.getFunction('createStorage', null),
        render = config.getFunction('render');


    return (behavior, context) => {
        const storage = createStorage ? createStorage() : null;

        if (!(storage instanceof Storage)) {
            throw new ConfigError(
                "[commonView] Configured function 'getStorage' must "
                + 'return an instance of class Storage');
        }

        let propsConfig = null;

        const stream =
            publisherToEventStream(behavior)
                .combineLatest(
                    storage.modificationEvents
                        .startWith(null), (props, _) => {
                            let params = null;

                            propsConfig = new Config(props);

                            if (!storage) {
                                params = {
                                    propsConfig
                                };
                            } else {
                                params = {
                                    propsConfig,
                                    context,
                                    store: storage.store,
                                    ctrl: storage.controller,
                                    dispatch: storage.dispatcher
                                }
                            }

                            return render(params);
                        });

        storage.notificationEvents.subscribe({
            next: notification => {
                const
                    notificationIsArray = Array.isArray(notification),
                    notificationIsObject = notification !== null & typeof notification === 'object';

                if (notificationIsArray || notificationIsObject) {
                    const [type, event] =
                        notificationIsArray
                            ? notification
                            : [notification.type, notification];

                    if (type && typeof type === 'string') {
                        const callback = propsConfig.getFunction('on' + type[0].toUpperCase() + type.substr(1), null);

                        if (callback) {
                            callback(event);
                        }
                    }
                }
            },

            error: err => {
                setTimeout(() => {
                    throw err;
                }, 0);
            }
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

