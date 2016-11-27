import { createElement, defineComponent, isElement, mount } from 'js-surface/core';
import { Emitter, Publisher, Types } from 'js-surface/util';

export {
    createElement,
    defineCommonComponent,
    isElement,
    mount,
    Types
};
/*
const p1 = new Emitter();
const p2 = new Emitter();

let n1 = 1;
let n2 = 1000;

setInterval(() => p1.next(n1++), 1000);
setInterval(() => p2.next(n2++), 2000)


const p3 = p1.combineLatest(p2.startWith(11111111), (v1, v2) => [v1, v2]);
p3.subscribe(value => console.log(1111, value));
p3.subscribe(value => console.log(222, value));
*/
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
                controller = createController(
                    config.commands,
                    () => state,
                    newState => {//console.log('newstate', newState)
                        state = newState;
                        stateEmitter.next(state);
                    });
                
            stateEmitter.subscribe({next(value) {
                console.log('-------------- state ---', value);
            }})
                
            inputs.subscribe({next(value) {
                console.log('-------------- inputs --', value);
            }})
                
            const views = inputs.combineLatest(stateEmitter.startWith({pageIndex: 0}), (nextProps, nextState)  => {
                
                /*
                    if (!mounted) {console.log(44444444444)
                        if (config.prepareState) {
                            nextState = state = config.prepareState(nextProps);
                        }
      
                        mounted = true;
                    }
                  */  
                    
                   // console.log('next:::', nextProps, nextState)
                    return config.render({ props: nextProps, state: nextState, controller });
                });
                
            /*    
            views.subscribe({
                next(value) {
                    console.log('-------------- views --');
                }
            })*/
              // const views2 = inputs.combineLatest(stateEmitter.startWith(0),(props, state) => config.render({props, state, commands}));
                
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