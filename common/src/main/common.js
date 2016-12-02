import { defineComponent, isElement, mount } from '../../../core/src/main/core.js';
import registerCustomElement from '../../../util/src/main/registerCustomElement.js';
import Emitter from '../../../util/src/main/Emitter.js';
import Types from '../../../util/src/main/Types.js';
import createElement from '../../../util/src/main/hyperscript.js';

export {
    createElement,
    defineCommonComponent as defineComponent,
    defineIntents,
    isElement,
    mount,
    registerCustomElement,
    Types
};

function defineIntents(config) {
    const ret = {};

    for (let type in config) {
        if (config.hasOwnProperty(type)) {
            ret[type] = createIntent(type,  config[type]);
        }
    }

    return ret;
}

function createIntent(type, hasArgs) {
    let ret;

    if (!hasArgs) {
        ret = { type };
    } else {
        ret = (...args) => ({
            type,
            payload: args
        });
    }

    return ret;
}

function defineCommonComponent(config) {
    const coreConfig = {};

    coreConfig.name = config.name;

    if (config.properties !== undefined) {
        coreConfig.properties = config.properties;
    }

    coreConfig.initialize = inputs => {
        let state = null,
            mounted = false;

        const
            stateEmitter = new Emitter(),

            interactions = config.initInteractions
                ? config.initInteractions({ send: (it => send(it)) })
                : null,

            send = createSendFunc(
                config.stateTransitions,
                () => state,
                newState => {
                    state = newState;
                    stateEmitter.next(state);
                },
                interactions),

            methods = {};

        let newInputs = inputs;

        if (config.onNextProps) {
            newInputs = inputs.scan((props, nextProps, idx) => {
                if (idx > 0) {
                    config.onNextProps({ props, nextProps });
                }

                return props;
            });
        }

        let propsAndStateStream = newInputs.combineLatest(stateEmitter.startWith(0),
            (props, state) => [props, state]);

        let prevProps = null, prevState = null;

        if (config.needsUpdate) {
            propsAndStateStream = propsAndStateStream.filter(([nextProps, nextState], idx) => {
                return idx === 0 || !!config.needsUpdate({ props: prevProps, nextProps, state: prevState, nextState });
            });
        }

        const views = propsAndStateStream.map(([nextProps, nextState])  => {
            if (!mounted) {
                if (config.initState) {
                    const stateResult = config.initState(nextProps);
                    nextState = state = stateResult;
                }

                if (config.onWillMount) {
                    config.onWillMount({ props: nextProps, state: nextState, send  });
                }

                if (config.onDidMount) {
                defer(() => config.onDidMount({ props: nextProps, state: nextState, send }));
                }

                mounted = true;
            } else {
                if (config.onWillUpdate) {
                    config.onWillUpdate({ props: prevProps, nextProps, state: prevState, nextState, send });
                }

                if (config.onDidUpdate) {
                    defer(() => config.onDidUpdate({ props: nextProps, prevProps, state: nextState, prevState, send }));
                }
             }

            // TODO
            try {
                let r =config.render({ props: nextProps, prevProps, state: nextState, prevState, send  });

                prevProps = nextProps,
                prevState = nextState;

                return r;
            } catch(e) {
                console.error(e);
                throw e;
            }
        });

        if (config.methods) {
            for (let methodName in config.methods) {
                if (config.methods.hasOwnProperty(methodName)) {
                    methods[methodName] = (...args) => {
                        config.methods[methodName](...args)({ props: prevProps, state: prevState, send });
                    };
                }
            }
        }

        const ret = {
            methods,
            views
        };

        return ret;
    };

    return defineComponent(coreConfig);
}


function createSendFunc(stateTransitions, getState, setState, interactions) {
    return function send(intent) {
        defer(() => {
            if (stateTransitions) {
                if (stateTransitions.hasOwnProperty(intent.type)) {
                    const
                        currState = getState(),
                        payload = intent.payload || [],
                        nextState = stateTransitions[intent.type](...payload)(currState);
                        setState(nextState);
                }
            } else if (typeof interactions === 'function') {
                interactions(intent, send)
            } else if (interactions && interactions.hasOwnProperty(intent.type)) {
                interactions[intent.type](intent);
            }
        });
    };
}

function defer(fn) {
    setTimeout(fn, 0);
}
