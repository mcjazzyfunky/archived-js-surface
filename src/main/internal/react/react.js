import adaptFunctionalComponent from
	'../component/adaptions/adaptFunctionalComponent.js';

import adaptBasicComponent from
	'../component/adaptions/adaptBasicComponent.js';

//import defineMessages from './api/defineMessages.js';
//import defineStore from './api/defineStore.js';
//import hyperscript from './api/hyperscript.js';
//import Injector from './api/Injector.js';

export function createCommonMethods(React) {
	const commonMethods = {
		defineFunctionalComponent(config) {
			return adaptFunctionalComponent(config, adjustedConfig => {
				const ret = props => adjustedConfig.render(props);

				ret.displayName = adjustedConfig.name;

				return ret;
			});
		},

		defineBasicComponent(config) {
			return adaptBasicComponent(config, adjustedConfig => {
				class ExtCustomComponent extends CustomComponent {
					constructor(...args) {
						super(args, adjustedConfig);
					}
				}

				ExtCustomComponent.displayName = adjustedConfig.name;

				return React.createFactory(ExtCustomComponent);
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
	    constructor(superArgs, config) {
	        super(...superArgs);

			this.__viewToRender = null;
			this.__initialized  = false;

			const
				{ sendProps, methods } = config.initProcess(
					view => {
						this.__viewToRender = view;

						if (this.__initialized) {
							this.forceUpdate();
						} else {
							this.__initialized  = true;
						}});

			this.__sendProps = sendProps;

			if (methods) {
				Object.assign(this, methods);
			}
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
	    	return this.__viewToRender;
	    }
	}

	return commonMethods;
}

