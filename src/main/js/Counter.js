'use strict';

import Component from './Component.js';

export default Component.createFactory({
    typeName: 'facekit/Counter',
    
    initialState: {counter: 0},
    
    stateTransitions: {
        incCounter: {
            counter: {$update: n => n + 1}
        }
    },

    view: (dom, props, state, {incCounter}) => {
        return dom.div(
            null,
            dom.label(null, state.get('counter')),
            dom.button({
                onClick: () => 
                    incCounter()
                        .then(newState => props.callAsync('onUpdate', newState.get('counter')))
            }, "+")
        );
    },
    
    defaultProps: {
        text: ''
    }
});