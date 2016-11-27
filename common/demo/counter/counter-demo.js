import { defineCommonComponent, mount, createElement as htm, Types } from 'js-surface/common';

const commands = {
    increase(delta) {
        return state => ({ counterValue: state.counterValue + delta });
    },
    
    reset(value) {
        return state => ({ counterValue: value });
    }
};

const Counter = defineCommonComponent({
    name: 'Counter',
   
    commands,
    
    properties: {
        initValue: {
            type: Types.number,
            defaultValue: 0
        },
        style: {
            type: Types.object,
            defaultValue: null
        }
    },
    
    prepareState(props) {
        return { counterValue: props.initValue };
    },
    
    initiate({ ctrl }) {
        return {
            onWillMount() {
                console.log('will mount Counter');
            },
            
            onDidMount() {
                console.log('did mount Counter');  
            },
            
            onWillUpdate() {
                console.log('will update Counter');
            },
            
            onDidUpdate() {
                console.log('did update Counter');
            },
            
            onWillUnmount() {
                console.log('will unmount Counter');
            },
            
            render({ props, state }) {
                 return (
                    htm('span',
                        {style: props.style},
                        htm('button',
                            { onClick: () => ctrl.increase(-1) },
                            '-'),
                        
                        htm('div',
                            { style: {width: '30px', display: 'inline-block', textAlign: 'center' }},
                            ' ' + state.counterValue + ' '),
                            
                        htm('button',
                            { onClick: () => ctrl.increase(1) } ,
                            '+'))
                );
            },
            
            increment(delta) {
                ctrl.increase(delta);
            },
            
            reset(value) {
                ctrl.reset(value);
            }
        };
    }
});

const CounterCtrl = defineCommonComponent({
    name: 'CounterCtrl',
    
    initiate() {
        let counter = null;
 
        return {
            render() {    
                return (
                    htm("div",
                        null,
                        htm('button', {onClick: () => counter.reset(0) }, 'Reset to 0'),
                        ' ',
                        Counter({ref: node => counter = node, style: {margin: '0 20px'}}),
                        ' ',
                        htm('button', {onClick: () => counter.reset(100) }, 'Reset to 100'))
                );           
            }
        };
    }
});

mount(CounterCtrl(), 'main-content');

/*
setTimeout(() => {
    mount(htm('div', null, 'done'), 'main-content'); 
}, 4000);
*/