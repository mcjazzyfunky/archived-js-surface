import { render as renderInferno } from '../node_modules/inferno/dist/inferno.js';
import createInfernoElement from '../node_modules/inferno/dist/inferno-create-element.js';
import InfernoComponent from '../node_modules/inferno/dist/inferno-component.js';
import { getExports } from './shared/inferno/inferno.js';

const {
	createElement,
	defineComponent,
	defineIntents,
	isElement,
	mount,
	Types
} = getExports({ InfernoComponent, createInfernoElement, renderInferno });

export {
	createElement,
	defineComponent,
	defineIntents,
	isElement,
	mount,
	Types
};
