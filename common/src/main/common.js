import { defineComponent, isElement, mount } from '../../../core/src/main/core.js';
import Emitter from '../../../util/src/main/Emitter.js';
import Types from '../../../util/src/main/Types.js';
import createElement from '../../../util/src/main/hyperscript.js';

export {
    createElement,
    defineCommonComponent as defineComponent,
    defineIntents,
    isElement,
    mount,
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
            effectHandler = config.initEffectHandler
                ? config.initEffectHandler({ send })
                : null,

            send = createSendFunc(
                config.stateTransitions,
                () => state,
                newState => {
                    state = newState;
                    stateEmitter.next(state);
                },
                effectHandler),
    
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

        if (config.needsUpdate) {
            propsAndStateStream = propsAndStateStream.filter(([props, state], idx) => {
                return idx === 0 || !!config.needsUpdate({ props, state }); 
            });
        } 

        const views = propsAndStateStream.map(([nextProps, nextState])  => {
            if (!mounted) {
                if (config.initState) {
                    const stateResult = config.initState(nextProps);
                    nextState = state = stateResult;
                }
                
                if (config.onWillMount) {
                    config.onWillMount({ nextProps, send  });
                }
                
                if (config.onDidMount) {
                defer(() => config.onDidMount({ props: nextProps }));
                }

                mounted = true;
            } else {
                if (config.onWillUpdate) {
                    config.onWillUpdate({ send });
                }
                
                if (config.onDidUpdate) {
                    defer(() => config.onDidUpdate({ send }));
                }
             }
           
            // TODO 
            try {
                let r =config.render({ props: nextProps, state: nextState, send  });
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
                        config.methods[methodName](...args)({ send });
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


function createSendFunc(stateTransitions, getState, setState, handleEffects) {
    return function send(intent) {
        if (stateTransitions) {
            if (stateTransitions.hasOwnProperty(intent.type)) {
                const
                    currState = getState(),
                    payload = intent.payload || [],
                    nextState = stateTransitions[intent.type](...payload)(currState);
                    setState(nextState);
            }
        } else if (handleEffects) {
            handleEffects({ intent, send })
        }
    };
}

function defer(fn) {
    setTimeout(fn, 0);
}