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
	defineComponent,
	isElement,
	render,
	Constraints
};

function render(Component) {
	AppRegistry.registerComponent('AppMainComponent', () => Component);
}
