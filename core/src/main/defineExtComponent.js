import defineBaseComponent from './defineBaseComponent.js';
import Emitter from '../../../util/src/main/Emitter.js';

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

	        const contents = propsAndStateStream.map(([nextProps, nextState])  => {
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
	                let r = config.render({ props: nextProps, prevProps, state: nextState, prevState, send  });

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
	            contents,
	            methods
	        };

	        return ret;
	    };
	}

    return defineBaseComponent(baseConfig, adapter);
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
                interactions(intent, send);
            } else if (interactions && interactions.hasOwnProperty(intent.type)) {
                interactions[intent.type](intent);
            }
        });
    };
}

function defer(fn) {
    setTimeout(fn, 0);
}
