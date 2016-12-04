import defineBaseComponent from './defineBaseComponent.js';
import Emitter from '../util/Emitter.js';
import warn from '../util/warn.js';

const NO_OP = () => {};

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
        subscr;

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


    inputs.subscribe({
        next(props) {
            handleNext(props, state, true);
        },
        error(err) {
            contentEmitter.error(err);
            subscr.unsubscribe();
            subscr = null;
        },
        complete() {
            contentEmitter.complete();
            subscr.unsubscribe();
            subscr = null;

            if (config.onWillUnmount) {
            	config.onWillUnmount();
            }
        }
    }),

    subscr = stateEmitter.subscribe({
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
		        config.onWillMount({ props: nextProps, state, send });
		    }
		} else if (config.onNextProps) {
			config.onNextProps({
				props,
				nextProps,
				state,
				send
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
                	{ props, nextProps, state, nextState, send }));
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
    return function send(subject, ...rest) {
    	const subjectIsString = typeof subject === 'string';

    	let intent;

    	if (!subjectIsString && (subject === null || typeof subject !== 'object')) {
    		warn('Illegal internal component intent has been sent', subject);
    	} else if (subjectIsString) {
    		 intent = {
        		type: subject
        	};

        	if (rest.length > 0) {
        		intent.payload = rest;
        	}
    	} else {
    		intent = subject;
    	}

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
            } else {
            	warn('Illegal intent', intent);
            }
       });
   };
}
