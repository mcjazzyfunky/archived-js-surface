'use strict';

import {
    Config, ConfigError, Storage
} from 'js-prelude';

import {Publisher, Processor} from 'js-surface';

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
        render = config.getFunction('render'),
        onWillMount = config.getFunction('onWillMount', null),
        onDidMount = config.getFunction('onDidMount', null),
        onWillUnmount = config.getFunction('onWillUnmount', null),
        onDidUnmount = config.getFunction('onDidUnmount', null),
        onWillUpdate = config.getFunction('onWillUpdate', null),
        onDidUpdate = config.getFunction('onDidUpdate', null);


    return (behavior, context) => {
        const storage = createStorage ? createStorage() : null;

        if (!(storage instanceof Storage)) {
            throw new ConfigError(
                "[commonView] Configured function 'getStorage' must "
                + 'return an instance of class Storage');
        }

        let
            index = -1,
            params = null,
            propsConfig = null;


        const contentProcessor = new Processor();

        const performRendering = () => {
            const params =
                !storage

                    ? {
                    props: propsConfig
                }

                : {
                    props: propsConfig,
                    context,
                    store: storage.store,
                    ctrl: storage.controller,
                    dispatch: storage.dispatcher
                };

            ++index;
            
            if (index === 0 && onWillMount) {
                onWillMount(params);
            } else if (index > 0 && onWillUpdate) {
                onWillUpdate(params);
            }

            contentProcessor.next(render(params));

            if (index === 0 && onDidMount) {
                setTimeout(() => onDidMount(params), 0);
            } else if (index > 0 && onDidUpdate) {
                setTimeout(() => onDidUpdate(params), 0);
            }
        };

        behavior.subscribe({
            next(props) {
                propsConfig = new Config(props);
                performRendering();
            },

            error(err) {
                contentProcessor.error(err);
            },

            complete() {
                if (onWillUnmount) {
                    onWillUnmount(props);
                }

                contentProcessor.complete();

                if (onDidUnmount) {
                    onDidUnmount(props);
                }
            }
        });

        storage.modificationEvents.subscribe(_ => {
            performRendering();
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

        return contentProcessor;
    };
}


