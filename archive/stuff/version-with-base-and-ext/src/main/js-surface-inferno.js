import { render as renderInferno } from 'inferno';
import createInfernoElement from 'inferno-create-element';
import InfernoComponent from 'inferno-component';
import { getExports } from './platform/inferno.js';

const {
	createElement,
	defineComponent,
	isElement,
	mount,
	Types
} = getExports({ InfernoComponent, createInfernoElement, renderInferno });

export {
	createElement,
	defineComponent,
	isElement,
	mount,
	Types
};
