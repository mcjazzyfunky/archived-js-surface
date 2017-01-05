import {
	createElement as dom,
	defineAdvancedComponent,
	defineMessages,
	defineStore,
} from 'js-surface';

const Action = defineMessages({
	reducers: {
		SetDateTime: dateTime => state => ({
			...state,
			dateTime
		})
	},
	effects: {
		SubscribeToTimer: () => ({ data, dispatch }) => {
			if (data.timerId) {
				clearInterval(data.timerId);
			}

			const timerId = setInterval(() => {
				dispatch(Action.SetDateTime(new Date()));
			}, 1000);

			return { ...data, timerId };
		},

		UnsubscribeFromTimer: () => ({ data }) => {
			if (data.timerId) {
				clearInterval(data.timerId);
			}

			return { ...data, timerId: null };
		},

		UpdateDateTime: () => ({ dispatch }) => {
			dispatch(Action.SetDateTime(new Date()));
		}
	}
});


const createStore = defineStore({
	messageClass: Action,

	initialState: {
		dateTime: null
	},

	initialData: {
		timerId: null
	}
});

export default defineAdvancedComponent({
	name: "AdvancedClock",

	properties: {
		label: {
			type: String,
			defaultValue: 'Date/Time'
		}
	},

	init() {
		return createStore();
	},

	onWillMount({ dispatch }) {
		dispatch(
			Action.UpdateDateTime(),
			Action.SubscribeToTimer());
	},

	onWillUnmount({ dispatch }) {
		dispatch(Action.UnsubscribeFromTimer());
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
