export default class VirtualStandardComponent {
	constructor(initialProps, config, sendProps) {
		this.__props = initialProps;
		this.__state = this.getInitialState(initialProps);
	}

	get props() {
		return this.__props;
	}

	get state() {
		return this.__state;
	}

	init(props) {
		this.__state = null;
	}

	set state(newState) {
		const oldState = this.__state;

		this.__state = newState;
	}

	shouldUpdate(params) {
		return true;
	}

	onNextProps(params) {
	}

	onWillMount(params) {
	}

	onDidMount(param) {
	}

	onWillUpdate(params) {
	}

	onDidUpdate(params) {
	}

	onWillUnmount(params) {
	}

	render(params) {
		return null;
	}
}
