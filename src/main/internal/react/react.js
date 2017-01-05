import defComp from '../core/defComp.js';

export function createCommonMethods(React) {
	const commonMethods = {
		defineComponent(config) {
			const ExtCustomComponent = function (args, sendProps, getView) {
				CustomComponent.apply(this, args, config, sendProps, getView);
			};

			ExtCustomComponent.displayName = config.name;

			return defComp(config, config => {
				return (...args) => {
					let viewToRender = null;

					const
						{ sendProps, methods } = config.initControl(
							view => { viewToRender = view; }),

						component = new ExtCustomComponent(
							args, sendProps, () => viewToRender);

					return Object.assign(component, methods);
				};
			});
		},

		createElement: React.createElement,

		isElement(it)  {
	    	return it !== undefined
	    		&& it !== null
	    		&& React.isValidElement(it);
		}
	};

	class CustomComponent extends React.Component {
	    constructor(superArgs, config, sendProps, getView) {
	        super(...superArgs);

	        this.__config = config;
	        this.__sendProps = sendProps;
	        this.__getView = getView;
	    }

	    componentWillMount() {
	    	this.__sendProps(this.props);
	    }

	    componentWillUnmount() {
			this.__sendProps(undefined);
	    }

	    componentWillReceiveProps(nextProps) {
	    	this.__sendProps(nextProps);
	    }

	    shouldComponentUpdate() {
	    	return false;
	    }

	    render() {
	    	return this.__getView();
	    }
	}

	return commonMethods;
}

