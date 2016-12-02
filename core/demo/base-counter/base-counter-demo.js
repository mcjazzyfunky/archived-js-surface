import { defineComponent, mount, createElement as htm, Types } from 'js-surface';
import Emitter from '../../../util/src/main/Emitter.js';

const CounterLabel = defineComponent({
    name: 'CounterLabel',

    properties: {
        value: {
            type: Types.number
        }
    },

    process(props) {
        return htm('label', null, htm('b', null, props.value));
    }
});

const Counter = defineComponent({
    name: 'Counter',

    properties: {
        textDecrement: {
            type: Types.string,
            defaultValue: '-',
        },
        textIncrement: {
            type: Types.string,
            defaultValue: '+'
        },
        style: {
            type: Types.object,
            defaultValue: null
        }
    },

    initProcess(inputs) {
        const contents = new Emitter();

        var props = null, counterValue = 0;

        const increase = delta => {
            counterValue += delta;
            contents.next(getContent());
        };

        const reset = value => {
            counterValue = value;
            contents.next(getContent());
        };

        inputs.subscribe(p => {
             props = p;
             contents.next(getContent());
        });

        const getContent = () =>
            htm('span',
                {style: props.style},
                htm('button', {onClick: () => increase(-1)}, props.textDecrement),
                htm('div',
                    {style: {width: '30px', display: 'inline-block', textAlign: 'center'}},
                    CounterLabel({value: counterValue})),
                htm('button', {onClick: () => increase(1)}, props.textIncrement));

        return {
            contents,
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


    const btnText1 = 'Reset to 0 ',
        btnText2 = 'Reset to 100 ';

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
            defaultValue: 'en'
        }
    },


    initProcess: inputs => {
        const contents = new Emitter();

        inputs.subscribe(props => {
            contents.next(counterCtrlView(props));
        });

        return { contents };
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
            htm(CounterCtrl, {label: '2)'}))), 'main-content');