'use strict';

import Model from './Model.js';
import {Config, ConfigError} from 'js-prelude';
import {Emitter, Publisher} from 'js-surface';

export default class View {
    static define(spec) {
        const
            typeOfSpec = typeof spec,
            specIsFunction = typeOfSpec === 'function',
            specIsObject = spec !== null && typeOfSpec === 'object';
    
        if (!specIsFunction && !specIsObject) {
            throw new TypeError(
                '[CommonView.create] '
                + "First argument 'spec' must either be an object or a function");
        }
    
        return (
            specIsFunction
            ? commonViewFromFunction(spec)
            : commonViewFromObject(spec)
        );
    }
}

function commonViewFromFunction(renderFunction) {
    return (propsPublisher, context) => {
        return new Publisher(subscriber => {
            return propsPublisher.subscribe({
                next(props) {
                    subscriber.next(
                        renderFunction({
                            props: new Config(props),
                            context
                        }));
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
        getModel = config.getFunction('getModel', null),
        render = config.getFunction('render'),
        onWillMount = config.getFunction('onWillMount', null),
        onDidMount = config.getFunction('onDidMount', null),
        onWillUnmount = config.getFunction('onWillUnmount', null),
        onDidUnmount = config.getFunction('onDidUnmount', null),
        onWillUpdate = config.getFunction('onWillUpdate', null),
        onDidUpdate = config.getFunction('onDidUpdate', null);

    return (propsPublisher, contentPublisher, context) => {
        const model = getModel ? getModel() : null;
        
        if (!(model instanceof Model)) {
            throw new ConfigError(
                "[commonView] Configured function 'getModel' must "
                + 'return an instance of class Model');
        }

        let
            index = -1,
            params = null,
            propsConfig = null,
            node = null,
            preventRendering = false;


        const contentEmitter = new Emitter();

        const performRendering = () => {
            if (preventRendering) {console.log('go away')
                return;
            } else {
                "come in"
            }
            
            params =
                !model

                    ? {
                    props: propsConfig
                }

                : {
                    props: propsConfig,
                    context,
                    store: model.store,
                    ctrl: model.controller,
                    dispatch: model.dispatcher
                };
            
            if (node !== null) {
                params.node = node;
            }
            ++index;
            console.log('Prevent rendering')
            preventRendering = true;
            
            if (index === 0 && onWillMount) {
                onWillMount(params);
            } else if (index > 0 && onWillUpdate) {
                onWillUpdate(params);
            }
            
            preventRendering = false;
            console.log('Allow rendering')
            contentEmitter.next(render(params));

            if (index === 0 && onDidMount) {
                setTimeout(() => {
                    onDidMount(Object.assign(params, {node}));
                }, 0);
            } else if (index > 0 && onDidUpdate) {
                setTimeout(() => onDidUpdate(params), 0);
            }
        };

        propsPublisher.subscribe({
            next(props) {
                propsConfig = new Config(props);
                performRendering();
            },

            error(err) {
                contentEmitter.error(err);
            },

            complete() {
                if (onWillUnmount) {
                    onWillUnmount(params);
                }

                contentEmitter.complete();

                if (onDidUnmount) {
                    onDidUnmount(params);
                }
            }
        });
        
        contentPublisher.subscribe(content => {
            node = content.node;
        });

        
        model.modificationEvents.subscribe(_ => {
          try {console.log("calling perform Rendering")
          if (!preventRendering)
              performRendering();
          } catch (err) {
              console.error(err)
          }
        });
        
        model.notificationEvents.subscribe({
            next: notification => {
                const
                    notificationIsArray = Array.isArray(notification),
                    notificationIsObject =
                        notification !== null
                        && typeof notification === 'object';

                if (notificationIsArray || notificationIsObject) {
                    const [type, event] =
                        notificationIsArray
                            ? notification
                            : [notification.type, notification];

                    if (type && typeof type === 'string') {
                        const callback = propsConfig.getFunction(
                            'on' + type[0].toUpperCase()
                            + type.substr(1), null);

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

        return contentEmitter;
    };
}
