import { defineComponent, isElement, mount } from '../../../core/src/main/core.js';
import Emitter from '../../../util/src/main/Emitter.js';
import Types from '../../../util/src/main/Types.js';
import createElement from '../../../util/src/main/hyperscript.js';

export {
    createElement,
    defineCommonComponent as defineComponent,
    isElement,
    mount,
    Types
};

function defineCommonComponent(config) {
    const coreConfig = {};
    
    coreConfig.name = config.name;
    
    if (config.properties !== undefined) {
        coreConfig.properties = config.properties;
    }
    
    if (config.render !== undefined) {
        coreConfig.initialize = inputs => {
            let state = null,
                mounted = false;
           
            const
                stateEmitter = new Emitter(),
                ctrl = createController(
                    config.commands,
                    () => state,
                    newState => {
                        state = newState;
                        stateEmitter.next(state);
                    });
                
            const views = inputs.combineLatest(stateEmitter.startWith({pageIndex: 0}), (nextProps, nextState)  => {
                    if (!mounted) {
                        if (config.prepareState) {
                            nextState = state = config.prepareState(nextProps);
                        }
      
                        mounted = true;
                    }
                   
                    
                    return config.render({ props: nextProps, state: nextState, ctrl });
                });
                
            return { views };
        };   
    } else {
        coreConfig.initialize = inputs => {
            let state = null,
                mounted = false;
           
            const
                stateEmitter = new Emitter(),
        
                ctrl = createController(
                    config.commands,
                    () => state,
                    newState => {
                        state = newState;
                        stateEmitter.next(state);
                    }),
        
                features = config.initiate({ ctrl }),
                methods = {};
                
            if (features) {
                for (let featureName in features) {
                    if (features.hasOwnProperty(featureName)
                        && featureName !== 'render'
                        && featureName !== 'onWillMount'
                        && featureName !== 'onDidMount'
                        && featureName !== 'onWillUpdate'
                        && featureName !== 'onDidUpdate'
                        && featureName !== 'onWillUnmount'
                        && featureName !== 'onDidUnmount') {
                        
                        methods[featureName] = features[featureName];
                    }   
                }
            }
        
            const ret = {
                methods,
                views: inputs.combineLatest(stateEmitter.startWith(null), (nextProps, nextState)  => {
                    if (!mounted) {
                        if (config.prepareState) {
                            const stateResult = config.prepareState(nextProps);
                            nextState = state = stateResult;
                        }
                        
                        if (features.onWillMount) {
                            features.onWillMount();
                        }
                        
                        if (features.onDidMount) {
                            defer(() => features.onDidMount());
                        }
      
                        mounted = true;
                    } else {
                        if (features.onWillUpdate) {
                            features.onWillUpdate();
                        }
                        
                        if (features.onDidUpdate) {
                            defer(() => features.onDidUpdate());
                        }
                     }
                    
                    return features.render({ props: nextProps, state: nextState });
                })
            };
            
            return ret;
        };   
    }
    
    
    return defineComponent(coreConfig);
}


function createController(commands, getState, setState) {
    const
        ret = {},
        commandNames = commands ? Object.getOwnPropertyNames(commands) : [];
    
    for (let commandName of commandNames) {
        ret[commandName] = (...args) => {
            const
                mapper = commands[commandName],
                currentState = getState(),
                nextState = mapper(...args)(currentState);

            setState(nextState);
        };
    }

    return ret;
}

function defer(fn) {
    setTimeout(fn, 0);
}