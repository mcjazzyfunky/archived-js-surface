import { defineComponent, mount, createElement as htm } from 'js-surface';
// import Emitter from '../../main/util/Emitter.js';

const CounterLabel = defineComponent({
    name: 'CounterLabel',

    properties: {
        value: {
            type: Number
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
            type: String,
            defaultValue: '-',
        },
        textIncrement: {
            type: String,
            defaultValue: '+'
        },
        label: {
        	type: String,
        	defaultValue: null
        },
        style: {
            type: Object,
            defaultValue: null
        }
    },

    initProcess(propsStream) {
        const contents = new Emitter();

        var counterValue = 0;

        const increase = delta => {
            counterValue += delta;
            contents.next(getContent());
        };

        const
        	reset = value => {
            	counterValue = value;
            	contents.next(getContent());
        	},

	        getContent = props =>
	            htm('span',
	                {style: props.style},
	                htm('label', null, props.label),
	                htm('button', {onClick: () => increase(-1)}, props.textDecrement),
	                htm('div',
	                    {style: {width: '30px', display: 'inline-block', textAlign: 'center'}},
	                    CounterLabel({value: counterValue})),
	                htm('button', {onClick: () => increase(1)}, props.textIncrement)),

        	subscriber = {
        		next(props) {
        			const content = getContent(props);
        			console.log("Rendered content", content);
        			return content;
        		},
        		error(err) {
        			console.error(err);
        		},
        		complete() {
        		}
        	};

        propsStream.subscribe(subscriber);

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


mount(
    htm('div',
        null,
        htm('div',
            null,
            Counter({label: '1)'})),
        htm('br'),
        htm('div',
            null,
            htm(Counter, {label: '2)'}))), 'main-content');