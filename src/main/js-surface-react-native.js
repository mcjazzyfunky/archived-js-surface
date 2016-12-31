import Constraints from './core/Constraints.js';
import { createCommonMethods } from './platform/react.js';
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
	mount,
	Constraints
};

function mount(Component) {
	AppRegistry.registerComponent('MainComponent', () => Component);
}
