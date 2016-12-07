import { defineComponent, mount, createElement as htm, Types } from 'js-surface';

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

// Counter intents
const
    // State transitions
    INCREASE_COUNTER = Symbol('increaseCounter'),
    RESET_COUNTER = Symbol('resetCounter'),

    // Interactions (aka side effects)
    LOG = Symbol('log');

const Counter = defineComponent({
    name: 'Counter',

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

    initState({ props }) {
        return { counterValue: props.initValue };
    },

    stateReducer: {
        [INCREASE_COUNTER](delta) {
            return state => ({ counterValue: state.counterValue + delta });
        },

        [RESET_COUNTER](value) {
            return state => ({ counterValue: value });
        }
    },

    initInteractor({ send }) {
    	return {
    		[LOG](msg, params) {
    			console.log(msg, JSON.stringify(params));
    			// alert(msg + JSON.stringify(params));
    		}
    	}
    },

    methods: {
        resetCounter(n) {
            return ({ props, state, send }) => {
                send(RESET_COUNTER, n);
            };
        }
    },

    needsUpdate({ send }) {
    	send(LOG, 'check whether update needed', arguments[0]);

        return true;
    },

    onNextProps({ send }) {
        send(LOG, 'next props for Counter - params:', arguments[0]);
    },

    onWillMount({ send }) {
        send(LOG, 'will mount Counter - params:', arguments[0]);
    },

    onDidMount({ send }) {
        send(LOG, 'did mount Counter - params:', arguments[0]);
    },

    onWillUpdate({ send }) {
        send(LOG, 'will update Counter - params:', arguments[0]);
    },

    onDidUpdate({ send }) {
        send(LOG, 'did update Counter - params:', arguments[0]);
    },

    onWillUnmount({ send }) {
        send(LOG, 'will unmount Counter - params:', arguments[0]);
    },

    render({ props, state, send }) {
         return (
            htm('span',
                {style: props.style},
                htm('button',
                    { onClick: () => send(INCREASE_COUNTER, -1) },
                    '-'),

                htm('div',
                    { style: {width: '30px', display: 'inline-block', textAlign: 'center' }},
                    CounterLabel({value: state.counterValue})),

                htm('button',
                    { onClick: () => send(INCREASE_COUNTER, 1) } ,
                    '+'))
        );
    }
});

// --------------------------------------------------------------------

// CountrCtrl actions
const RESET_CHILD_COUNTER = Symbol('resetChildCounter');

const CounterCtrl = defineComponent({
    name: 'CounterCtrl',

    initInteractor(send) {
    	return {
            [RESET_CHILD_COUNTER]: function (counterInstance, counterValue) {
                counterInstance.resetCounter(counterValue);
            }
        };
    },

    render({ send }) {
        let counterInstance = null;

        return (
            htm("div",
                null,
                htm('button', { onClick: () => send(RESET_CHILD_COUNTER, counterInstance, 0) }, 'Reset to 0'),
                ' ',
                Counter({ref: it => counterInstance = it, style: {margin: '0 20px'}}),
                ' ',
                htm('button', { onClick: () => send(RESET_CHILD_COUNTER, counterInstance	, 100) }, 'Reset to 100')));
    }
});

mount(CounterCtrl(), 'main-content');

/*
setTimeout(() => {
    mount(htm('div', null, 'done'), 'main-content');
}, 4000);
*/
