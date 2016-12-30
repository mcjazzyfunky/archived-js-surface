import { getExports } from './platform/react.js';
import React from 'react';
import AppRegistry from 'react-native';

const {
	createElement,
	defineComponent,
	isElement,
	Types
} = getExports(React);

export {
	createElement,
	defineComponent,
	isElement,
	mount,
	Types
};

function mount(Component) {
	// TODO - get rid of that 'MainApp'
	AppRegistry.registerComponent('MainApp', () => Component);
}
