export default class Component {
	constructor(initialProps) {
		this.__props = initialProps;
		this.__state = null;
		this.__refresh = null;
	}

	get props() {
		return this.__props;
	}

	get state() {
		return this.__state;
	}

	set state(nextState) {
		const
		    currState = this.state,
		    shouldUpdate = this.shouldUpdate(this.props, currState);

		this.__state = nextState;

		if (shouldUpdate) {
			this.onWillUpdate(this.props, nextState);
			this.refresh();
			this.onDidUpdate(this.props, currState);
		}
	}

	init(props) {
	}

	set state(newState) {
		const oldState = this.__state;

		if (this.shouldUpdate(this.props, newState)) {
			this.onWillUpdate(this.props, newState);

			this.refresh();

			this.onDidUpdate(this.props, oldState);
		}

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

	refresh() {
		if (this.__refresh) {
			this.__refresh();
		}
	}
}
