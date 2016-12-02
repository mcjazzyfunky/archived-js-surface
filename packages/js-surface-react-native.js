import { getExports } from './shared/react/react.js';
import React from 'react';
import AppRegistry from 'react-native';

const {
	createElement,
	defineComponent,
	defineIntents,
	isElement,
	Types
} = getExports(React);

export {
	createElement,
	defineComponent,
	defineIntents,
	isElement,
	mount,
	Types
};

function mount(Component) {
	// TODO - get rid of that 'MainApp'
	AppRegistry.registerComponent('MainApp', () => Component);
}
