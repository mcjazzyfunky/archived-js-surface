import { defineUsualComponent, defineFunctionalComponent, mount, createElement as htm } from 'js-surface';

const CounterInfo = defineFunctionalComponent({
    name: 'CounterInfo',

    properties: {
        value: {
            type: Number
        }
    },

    render(props) {
        return (
        	htm(
        		'label',
        		null,
        		htm('b',
        			null,
        			props.value)));
    }
});

// --------------------------------------------------------------------

const Counter = defineUsualComponent({
    name: 'Counter',

    properties: {
        initialValue: {
            type: Number,
            defaultValue: 0
        },
        onChange: {
        	type: Function
        }
    },

    publicMethods: {
    	resetCounter(value = 0) {
    		this.state = { counterValue: value };
    	}
    },

    initialize() {
        this.state = { counterValue: this.props.initialValue };
    },

	increaseCounter(delta) {
    	this.state = { counterValue: this.state.counterValue + delta };
	},

    needsUpdate() {
    	console.log('[needsUpdate]', arguments);
    	return true;
    },

    onNextProps(nextProps) {
        console.log('[onNextProps]', arguments);
    },

    onWillChangeState(nextState) {
        console.log('[onWillChangeState]', arguments);
    },

    onDidChangeState(prevState) {
        console.log('[onDidChangeState]', arguments);

        if (this.props.onChange) {
        	this.props.onChange({
        		type: 'change',
        		value: this.state.counterValue
        	});
        }
    },

    onWillMount() {
        console.log('[onWillMount]', arguments);
    },

    onDidMount() {
        console.log('[onDidMount]', arguments);
    },

    onWillUpdate() {
        console.log('[onWillUpdate]', arguments);
    },

    onDidUpdate() {
        console.log('[onDidUpdate]', arguments);
    },

    onWillUnmount() {
        console.log('[onWillUnmount]:', arguments);
    },

    render() {
         return (
            htm('span',
                { className: 'counter' },
                htm('button',
                    { onClick: () => this.increasesCounter(-1) },
                    '-'),
                htm('div',
                    null,
                    CounterInfo({ value: this.state.counterValue })),
                htm('button',
                    { onClick: () => this.increaseCounter(1) },
                    '+'))
        );
    }
});

// --------------------------------------------------------------------

const CounterCtrl = defineFunctionalComponent({
    name: 'CounterCtrl',

    render() {
        let counterInstance = null;

        return (
            htm('div',
                { className: 'counter-ctrl' },
                htm('button',
                	{ onClick: () => counterInstance.resetCounter(0) },
                	'Reset to 0'),
                	' ',
            		Counter({ ref: it => counterInstance = it }),
                	' ',
                	htm('button',
                		{ onClick: () => counterInstance.resetCounter(100) },
                		'Reset to 100')));
    }
});

mount(CounterCtrl(), 'main-content');

