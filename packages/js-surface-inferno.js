import { render as renderInferno } from 'inferno';
import createInfernoElement from 'inferno-create-element';
import InfernoComponent from 'inferno-component';
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
