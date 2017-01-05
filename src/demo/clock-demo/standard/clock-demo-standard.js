import {
	createElement as dom,
	defineStandardComponent,
} from 'js-surface';


export default defineStandardComponent({
	name: "StandardClock",

	properties: {
		label: {
			type: String,
			defaultValue: 'Date/Time'
		}
	},

	init() {
		this.state = { dateTime: null };
		this.timerId = null;
	},

	updateDateTime() {
		this.state = { ...this.state, dateTime: new Date() };
	},

	onWillMount() {
		this.updateDateTime();

		this.timerId = setInterval(() => {
			this.updateDateTime();
		}, 1000);
	},

	onWillUnmount({ dispatch }) {
		clearInterval(this.timerId);
		this.timerId = null;
	},

	render({ props, state }) {
		return (
			dom('div',
				null,
				dom('label',
					null,
					props.label),
				dom('span',
					null,
					state.dateTime)));
	}
});
