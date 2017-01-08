import Constraints from './api/Constraints.js';
import { createCommonMethods } from './internal/react/react.js';
import React from 'react';
import AppRegistry from 'react-native';

const {
	createElement,
	defineComponent,
	isElement
} = createCommonMethods(React);

export {
	createElement,
	defineAdvancedComponent,
	defineFunctionalComponent,
	defineBasicComponent,
	defineMessages,
	defineStandardComponent,
	defineStore,
	hyperscript,
	isElement,
	render,
	Constraints,
	Injector
};

function render(Component) {
	AppRegistry.registerComponent('AppMainComponent', () => Component);
}
