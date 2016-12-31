import { getExports } from './platform/react.js';
import Constraints from './core/Constraints.js';
import React from 'react';
import AppRegistry from 'react-native';

const {
	createElement,
	defineComponent,
	isElement
} = getExports(React);

export {
	createElement,
	defineComponent,
	isElement,
	mount,
	Constraints
};

function mount(Component) {
	AppRegistry.registerComponent('Main', () => Component);
}
