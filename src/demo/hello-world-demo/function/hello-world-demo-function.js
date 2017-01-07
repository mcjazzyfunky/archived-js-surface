import {
	createElement as dom,
	defineFunctionComponent,
	render
} from 'js-surface';

const HelloWorld = defineFunctionComponent({
	name: 'HelloWorld',

	properties: {
		name: {
			type: String,
			defaultValue: 'World'
		}
	},

	render({ name }) {
		return (
			dom('div',
				null,
				`Hello ${name}!`));
	}
});

render(HelloWorld({ name: 'John Doe' }), 'main-content');
