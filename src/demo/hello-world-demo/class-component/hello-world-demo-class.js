import {
	createElement as dom,
	defineClassComponent,
	render,
	Component
} from 'js-surface';


class HelloWorldComponent extends Component {
	constructor(...args) {
		console.log('Constructor args', ...args);
		super(...args);
	}

	shouldUpdate() {
		console.log('shouldUpdate');

		return true;
	}

	onNextProps() {
		console.log('onNextProps', arguments);
	}

	onWillMount() {
		console.log('onWillMount', arguments);
	}

	onDidMount() {
		console.log('onDidMount', arguments);
	}

	onWillUpdate() {
		console.log('onWillUpdate', arguments);
	}

	onDidUpdate() {
		console.log('onDidUpdate', arguments);
	}

	render() {console.log('RRRRRRRRRRRRRREEEEEEEEEEEEENNNNNNNNNNNNNNDDDDDDDDDDEEEEEEEEEEERRRRRRRRRRR')
		return (
			dom('div', null, `Hello ${this.props.name}!`)
		);
	}
}


const HelloWorld = defineClassComponent({
	name: 'HelloWorld',

	properties: {
		name: {
			type: String,
			defaultValue: 'World'
		}
	},

	componentClass: HelloWorldComponent
});

render(HelloWorld(), 'main-content');
