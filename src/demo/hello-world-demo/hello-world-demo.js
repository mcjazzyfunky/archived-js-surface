import {
	hyperscript as dom,
	defineFunctionalComponent,
	render
} from 'js-surface';

const HelloWorld = defineFunctionalComponent({
	name: 'HelloWorld',

	properties: {
		name: {
			type: String,
			defaultValue: 'World'
		}
	},

	render({ name }) {
		return (
			dom('div/p/div/p',
				null,
				`Hello ${name}!`));
	}
});

render(HelloWorld({ name: 'John Doe' }), 'main-content');

const elem = document.getElementById('info');
elem.innerText = document.getElementById('main-content').innerHTML;
