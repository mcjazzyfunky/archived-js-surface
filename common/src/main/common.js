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
                    config.stateTransitions,
                    () => state,
                    newState => {
                        state = newState;
                        stateEmitter.next(state);
                    });
                
            const views = inputs.combineLatest(stateEmitter.startWith({pageIndex: 0}), (nextProps, nextState)  => {
                    if (!mounted) {
                        if (config.initState) {
                            nextState = state = config.initState(nextProps);
                        }
      
                        mounted = true;
                    }
                   
                    
                    return config.render({ props: nextProps, state: nextState }, ctrl);
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
                    config.stateTransitions,
                    () => state,
                    newState => {
                        state = newState;
                        stateEmitter.next(state);
                    }),
        
                features = config.initBehavior( ctrl ),
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


            let newInputs = inputs;
            
            if (features.onNextProps) {
                newInputs = inputs.scan((props, nextProps, idx) => {
                    if (idx > 0) {
                        features.onNextProps({ props, nextProps });
                    }
                    
                    return props;
                });
            }
            
            let propsAndStateStream = newInputs.combineLatest(stateEmitter.startWith(0),
                (props, state) => [props, state]);
    
            if (features.needsUpdate) {
                propsAndStateStream = propsAndStateStream.filter(([props, state], idx) => {
                    return idx === 0 || !!features.needsUpdate({ props, state }); 
                });
            } 
    
            const views = propsAndStateStream.map(([nextProps, nextState])  => {
                if (!mounted) {
                    if (config.initState) {
                        const stateResult = config.initState(nextProps);
                        nextState = state = stateResult;
                    }
                    
                    if (features.onWillMount) {
                        features.onWillMount({ nextProps });
                    }
                    
                    if (features.onDidMount) {
                        defer(() => features.onDidMount({ props: nextProps }));
                    }
  
                    mounted = true;
                } else {
                    if (features.onWillUpdate) {
                        features.onWillUpdate({});
                    }
                    
                    if (features.onDidUpdate) {
                        defer(() => features.onDidUpdate());
                    }
                 }
                
                return features.render({ props: nextProps, state: nextState });
            });
                
            const ret = {
                methods,
                views
            };
            
            return ret;
        };   
    }
    
    
    return defineComponent(coreConfig);
}


function createController(stateTransitions, getState, setState) {
    const
        ret = {},
        commandNames = stateTransitions ? Object.getOwnPropertyNames(stateTransitions) : [];
    
    for (let commandName of commandNames) {
        ret[commandName] = (...args) => {
            const
                mapper = stateTransitions[commandName],
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