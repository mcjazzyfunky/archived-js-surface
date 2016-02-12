'use strict';

import Component from './Component.js';


export default class Counter extends Component {
    getTypeName() {
        return 'Counter';    
    } 
  
    getIntent({on, bind}) {
        const
            plusObs = on('plusButtonClicked')
                    .map(_ => 
                    
            minusObs = on('minusButtonClicked')
                    .map(_ => -1),
                    
            counterObs = Observable.merge(plusObs, minusObs)
                    .startWidth(0)
                    .scan((prev, next) => prev + next);
    }
  
    getView(dom, {on, bind}, propsObs) {
        const
            plusObs = on('plusButtonClicked')
                 .map(_ => 1),

            minusObs = on('minusButtonClicked')
                .map(_ => -1),

            counterObs = Observable.merge(plus, minus)
                .startWith(0)
                .scan((prev, curr) => prev + curr), 

            uiTreeObs = counterP.merge(propsObs, (counter, props) =>
                    dom.div(
                        null,
                        dom.button({ onClick: bind('minusButtonClicked') }, '+'),
                        dom.label(null, state);
                        dom.button({ onClick: bind('minusButtonClicked') }, '-'))),
    
            uiEvents: {
                update: counterObs.map(counter => {counter})
            };
            
        return {
            uiTree: uiTreeObs,
            uiEvents: uiEventsObs
        };
   };
}




/*
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
*/