import { getExports } from './platform/react/react.js';
import ReactLite from 'react-lite';

const {
	createElement,
	defineComponent,
	defineIntents,
	isElement,
	Types
} = getExports(ReactLite);

export {
	createElement,
	defineComponent,
	defineIntents,
	isElement,
	mount,
	Types
};

function mount(content, targetNode) {
    if (!isElement(content)) {
        throw new TypeError(
            "[mount] First argument 'content' has to be a valid element");
    }

    if (typeof targetNode === 'string') {
        targetNode = document.getElementById(targetNode);
    }

    return ReactLite.render(content, targetNode);
}
