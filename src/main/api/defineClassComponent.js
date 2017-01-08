import createPropsAdjuster from '../internal/component/helpers/createPropsAdjuster.js';
import { defineGeneralComponent } from 'js-surface';
import validateClassComponentConfig from '../internal/component/validations/validateClassComponentConfig.js';
import callAsync from '../internal/util/callAsync.js';


export default function defineClassComponent(config) {
	const err = validateClassComponentConfig(config);

	if (err) {
		throw err;
	}

	const
	    propsAdjuster = createPropsAdjuster(config),

		initProcess = onNextView => {
			let
				component = null,
				content = null,
				done = false;

			const sendProps = origProps => {
				if (done) {
					return;
				} else if (origProps === undefined) {
					if (component) {
						component.onWillUnmount();
					}

					done = true;
					return;
				}

				const props = propsAdjuster(origProps);

				if (!component) {
					component = new config.componentClass(props);

					component.refresh = function () {
						content = component.render();
						onNextView(content);
					};

					component.onWillMount();
					component.refresh();
					callAsync(() => callAsync(() => component.onDidMount()));
				} else {
					component.onNextProps(props);

					const shouldUpdate = component.shouldUpdate(props, component.state);

					if (shouldUpdate) {
						const
							oldProps = component.props,
							oldState = component.state;

						component.onWillUpdate(props, oldState);

						callAsync(() => component.onDidUpdate(oldProps, oldState));
					}

					// Sorry for that :-(
					component.__props = props;

					if (shouldUpdate) {
						component.refresh();
					}
				}
			};

			// TODO
			const methods = {};

			return {
				sendProps,
				methods
			};
		},

        adjustedConfig = {
		    name: config.name,
	        properties: config.properties,
		    initProcess
	    };

	return defineGeneralComponent(adjustedConfig);
}
