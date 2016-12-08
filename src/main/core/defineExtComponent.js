import defineBaseComponent from './defineBaseComponent.js';
import Emitter from '../util/Emitter.js';
import warn from '../util/warn.js';

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
        props = null,
        state = null,
        subscr = null;

    const
        contentEmitter = new Emitter(),
        stateEmitter = new Emitter(),
        getProps = () => props,
        getState = () => state,

        interactor = !config.initMiddleware
            ? null
            : config.initMiddleware({
                send: intent => send(intent)
            }),

        setState = nextState => {
            stateEmitter.next(nextState);
        },

        send = createSendFunc(
            getState, setState, config.stateReducer, interactor);


    inputs.subscribe({
        next(nextProps) {
            if (!hasStarted && config.initState) {
		        state = config.initState({ props: nextProps });
		    } else if (hasStarted && config.onNextProps) {
                config.onNextProps({ props, nextProps, state });
            }

		    if (!hasStarted && config.onWillMount) {
		        config.onWillMount({ props: nextProps, state, send });
		    }

    		if (!hasStarted  && config.onDidMount) {
    			defer(() => config.onDidMount({ props, state, send }));
    		}

            handleNextContent(hasStarted, props, nextProps, state, state, send, contentEmitter, config);

            props = nextProps;
            hasStarted = true;
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
        next(nextState) {
            handleNextContent(hasStarted, props, props, state, nextState, send, contentEmitter, config);
            state = nextState;
        },
        error(err) {
            console.log(err);
        }
    });

    return {
        getProps,
        getState,
        contents: contentEmitter.asPublisher(),
        send
    };
}

function handleNextContent(hasStarted, props, nextProps, state, nextState, send, contentEmitter, config) {
	if (hasStarted && config.needsUpdate && config.needsUpdate(
		{ props, nextProps, state, nextState, send })) {

        if (config.onWillUpdate) {
            config.onWillUpdate({
           		props,
           		nextProps,
           		state,
           		nextState,
           		send
            });
        }
	}

    contentEmitter.next(
        config.render({
            props: nextProps,
            prevProps: props,
            state: nextState,
            prevState: state,
            send
        }));

    if (hasStarted && config.onDidUpdate) {
        defer(() => config.onDidUpdate({
            props: nextProps,
            prevProps: props,
            state: nextState,
            prevState: state,
            send
        }));
    }
}

function createSendFunc(getState, setState, stateReducer, interactor) {
    return function send(subject, ...rest) {
    	const
    		typeOfSubject = typeof subject,

    		subjectIsStringOrSymbol = typeOfSubject === 'string'
    				|| typeOfSubject === 'symbol'
    				|| subject && subject.constructor === Symbol,

    		subjectIsObject = subject !== null && typeOfSubject === 'object',
    		subjectIsFunction = typeOfSubject === 'function';

    	let intent = null,
    		errMsg = null,
    		errSbj = null;

    	if (!subjectIsStringOrSymbol && !subjectIsObject && !subjectIsFunction) {
    		errMsg = 'Illegal internal component intent has been sent';
    		errSbj = subject;
    	} else if (subjectIsStringOrSymbol) {
    		 intent = {
        		type: subject
        	};

        	if (rest.length > 0) {
        		intent.payload = rest;
        	}
    	} else if (subjectIsObject && typeof subject.type !== 'string') {
    		errMsg = 'Illegal internal component intent type';
    		errSbj = subject;
    	} else {
    		intent = subject;
    	}

		if (!errMsg) {
			if (subjectIsFunction) {
    			intent.apply(null, rest);
			} else if (stateReducer && stateReducer.hasOwnProperty(intent.type)) {
                const
                    currState = getState(),
                    payload = intent.payload || [],
                    nextState = stateReducer[intent.type](...payload)(currState);

                defer(() => setState(nextState));
            } else if (typeof interactor === 'function') {
                interactor(intent);
            } else if (interactor && interactor.hasOwnProperty(intent.type)) {
                interactor[intent.type](...intent.payload);
            } else {
            	errMsg = 'Illegal component intent has been sent';
            	errSbj = intent;
            }
		}

		if (errMsg) {
			warn(errMsg, errSbj);
			throw new Error(errMsg);
		}
   };
}
