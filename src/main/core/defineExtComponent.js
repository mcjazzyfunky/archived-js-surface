import defineBaseComponent from './defineBaseComponent.js';
import Emitter from '../util/Emitter.js';

const NO_OP_FUNCTION = () => {};

export default function defineExtComponent(config, adapter) {
    const baseConfig = {};

    baseConfig.name = config.name;

    if (config.properties !== undefined) {
        baseConfig.properties = config.properties;
    }

	if (config.initProcess) {
		baseConfig.initProcess = config.initProcess;
	} else if (config.process) {
		baseConfig.process = config.process;
	} else {
	    baseConfig.initProcess = inputs => {

            const { contents, getState, getProps, send  }
                =  initiateCircuit(inputs, config),

                methods = {};

            if (config.methods) {
                for (let methodName in config.methods) {
                    if (config.methods.hasOwnProperty(methodName)) {
                        methods[methodName] = (...args) => {
                            config.methods[methodName](...args)({
                            	props: getState(),
                            	state: getProps,
                            	send
                            });
                        };
                    }
                }
            }

            return { contents, methods };
    	};
	}

    return defineBaseComponent(baseConfig, adapter);
}

function defer(fn) {
    setTimeout(fn, 0);
}


function initiateCircuit(inputs, config) {
    let hasStarted = false,
        props,
        prevProps,
        state,
        prevState,
        subscr1,
        subscr2;

    const
        contentEmitter = new Emitter(),
        stateEmitter = new Emitter(),
        getProps = () => props,
        getState = () => state,

        interactor = !config.initInteractor
            ? null
            : config.initInteractor({
                send: intent => send(intent)
            }),

        setState = newState => {
            state = newState;
            stateEmitter.next(state);
        },

        send = createSendFunc(
            getState, setState, config.stateReducer, interactor);


    subscr1 = inputs.subscribe({
        next(props) {
            handleNext(props, state, true);
        },
        error(err) {
            contentEmitter.error(err);
            subscr2.unsubscribe();
            subscr1 = subscr2 = null;
        },
        complete() {
            contentEmitter.complete();
            subscr2.unsubscribe();
            subscr1 = subscr2 = null;

            if (config.onWillUnmount) {
            	config.onWillUnmount();
            }
        }
    }),

    subscr2 = stateEmitter.subscribe({
        next(state) {
            handleNext(props, state, false);
        }
    });

	function handleNext(nextProps, nextState, isPropsChange) {
		if (!hasStarted) {
		    if (config.initState) {
		        state = config.initState(nextProps);
		    }

		    if (config.onWillMount) {
		        config.onWillMount({ props: nextProps, state, send })
		    }
		} else if (config.onNextProps) {
			config.onNextProps({
				props,
				nextProps,
				state
			});
		}

		if (isPropsChange) {
			prevProps = props;
			props = nextProps;
		} else {
			prevState = state;
			state = nextState;
		}


		if (!hasStarted || !config.needsUpdate || config.needsUpdate(
			{ props, nextProps, state, nextState })) {

            if (hasStarted && config.onWillUpdate) {
               config.onWillUpdate({ props, nextProps, state, nextState, send});
            }

            contentEmitter.next(config.render({
                props,
                prevProps,
                state,
                prevState,
                send
            }));

            if (hasStarted && config.onDidUpdate) {
                defer(() => config.onDidUpdate(
                	{ props, nextProps, state, nextState, send}));
            }
		}

		if (!hasStarted) {
			if (config.onDidMount) {
				defer(() => config.onDidMount({ props, state, send }));
			}
		}

		hasStarted = true;
	}

    return {
        getProps,
        getState,
        contents: contentEmitter.asPublisher(),
        send
    };
}


function createSendFunc(getState, setState, stateReducer, interactor) {
    return function send(intent) {
       defer(() => {
       		if (stateReducer && stateReducer.hasOwnProperty(intent.type)) {
                const
                    currState = getState(),
                    payload = intent.payload || [],
                    nextState = stateReducer[intent.type](...payload)(currState);
                    setState(nextState);
            } else if (typeof interactor === 'function') {
                interactor(intent, send);
            } else if (interactor && interactor.hasOwnProperty(intent.type)) {
                interactor[intent.type](...intent.payload);
            }
       });
   };
}
