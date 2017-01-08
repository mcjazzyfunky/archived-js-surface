import {
	createElement as dom,
	defineGeneralComponent,
	render
} from 'js-surface';

const HelloWorld = defineGeneralComponent({
	name: 'HelloWorld',

	properties: {
		name: {
			type: String,
			defaultValue: 'World'
		}
	},

	initProcess(onNextContent) {
		return {
			sendProps(props) {
				onNextContent(dom('div', null, 'Hello ' + props.name + '!'));
			}
		};
	}
});

render(HelloWorld(), 'main-content');
