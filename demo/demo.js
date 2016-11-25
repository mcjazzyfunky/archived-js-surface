import { defineComponent, mount, createElement as htm } from 'js-surface';
import Emitter from '../internal/src/main/util/Emitter.js';



const Counter = defineComponent({
    name: 'Counter',
    
    properties: {
        style: {
            type: value => null,
            defaultValue: null
        }
    },
    
    initialize(inputs) {
        const views = new Emitter();
        
        var props = null, counterValue = 0;
            
        const increase = delta => {
            counterValue += delta;
            views.next(getContent());
        };
        
        const reset = value => {
            counterValue = value;
            views.next(getContent());
        };
        
        inputs.subscribe(p => {
             props = p;
             views.next(getContent());
        });
            
        const getContent = () =>
            htm('span',
                {style: props.style},
                htm('button', {onClick: () => increase(-1)}, '-'),
                htm('div', {style: {width: '30px', display: 'inline-block', textAlign: 'center'}}, ' ' + counterValue + ' '),
                htm('button', {onClick: () => increase(1)}, '+'));
        
        return {
            views: views,
            methods: {
                reset(value = 0) {
                    reset(value);
                }
            }
        };
    }
});

const counterCtrlView = props => { 
    var elem = null;


    const btnText1 = 'Reset to 0 ' + props.lang,
        btnText2 = 'Reset to 100 ' + props.lang;

    return (
        htm("div",
            null,
            htm('label', {style: {margin: '0 20px 0 0', width: '100px', float: 'left', textAlign: 'right'}}, props.label),
            htm('button', {onClick: () => elem.reset(0) }, btnText1),
            ' ',
            Counter({ref: node => elem = node, style: {margin: '0 20px'}}),
            ' ',
            htm('button', {onClick: () => elem.reset(100) }, btnText2))
    );
};

const CounterCtrl = defineComponent({
    name: 'CounterCtrl',
    
    properties: {
        label: {
            type: value => null,
            defaultValue: ''
        },
        lang: {
            type: value => typeof value === 'string',
            defaultValue: 'en',
            implcit: true
        }
    },


    initialize: inputs => {
        const views = new Emitter();
        
        inputs.subscribe(props => {console.log(props)
            views.next(counterCtrlView(props));
        });
        
        return { views };
    }
});

mount(
    htm('div',
        null,
        htm('div',
            null,
            CounterCtrl({label: '1)'})),
        htm('br'),
        htm('div',
            null,
            CounterCtrl({label: '2)'}))), 'main-content');