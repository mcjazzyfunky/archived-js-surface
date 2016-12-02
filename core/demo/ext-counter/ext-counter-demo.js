import { defineComponent, defineIntents, mount, createElement as htm, Types } from 'js-surface';



const CounterLabel = defineComponent({
    name: 'CounterLabel',

    properties: {
        value: {
            type: Types.number
        }
    },

    render({ props }) {
        return htm('label', null, htm('b', null, props.value));
    }
});

// --------------------------------------------------------------------

const CounterIntents = defineIntents({
    increase: true,
    resetCounter: true
});

const Counter = defineComponent({
    name: 'Counter',

    stateTransitions: {
        increase(delta) {
            return state => ({ counterValue: state.counterValue + delta });
        },

        resetCounter(value) {
            return state => ({ counterValue: value });
        }
    },

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

    initState(props) {
        return { counterValue: props.initValue };
    },

    methods: {
        resetCounter(n) {
            return ({ props, state, send }) => {
                send(CounterIntents.resetCounter(n));
            };
        }
    },

    needsUpdate(params) {
        console.log('check wheter update needed - params:', params);

        return true;
    },

    onWillMount(params) {
        console.log('will mount Counter - params:', params);
    },

    onDidMount(params) {
        console.log('did mount Counter - params:', params);
    },

    onWillUpdate(params) {
        console.log('will update Counter - params:', params);
    },

    onDidUpdate(params) {
        console.log('did update Counter - params:', params);
    },

    onWillUnmount(params) {
        console.log('will unmount Counter - params:', params);
    },

    render({ props, state, send }) {
         return (
            htm('span',
                {style: props.style},
                htm('button',
                    { onClick: () => send(CounterIntents.increase(-1)) },
                    '-'),

                htm('div',
                    { style: {width: '30px', display: 'inline-block', textAlign: 'center' }},
                    CounterLabel({value: state.counterValue})),

                htm('button',
                    { onClick: () => send(CounterIntents.increase(1)) } ,
                    '+'))
        );
    }
});


// --------------------------------------------------------------------

const CounterCtrlIntents = defineIntents({
    resetCounter: true
});


const CounterCtrl = defineComponent({
    name: 'CounterCtrl',

    initInteractions(send) {
          return async function(intent) {
              const [counterInstance, counterValue] = intent.payload;
              counterInstance.resetCounter(counterValue);
          };
    },

    render({ send }) {
        let counterInstance = null;

        return (
            htm("div",
                null,
                htm('button', { onClick: () => send(CounterCtrlIntents.resetCounter(counterInstance, 0)) }, 'Reset to 0'),
                ' ',
                Counter({ref: it => counterInstance = it, style: {margin: '0 20px'}}),
                ' ',
                htm('button', { onClick: () => send(CounterCtrlIntents.resetCounter(counterInstance, 100)) }, 'Reset to 100')));
    }
});

mount(CounterCtrl(), 'main-content');

/*
setTimeout(() => {
    mount(htm('div', null, 'done'), 'main-content');
}, 4000);
*/