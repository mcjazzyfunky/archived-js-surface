import { createCommonMethods } from './internal/react/react.js';
import Constraints from './api/Constraints.js';
import ReactLite from 'react-lite';

const {
	createElement,
	defineComponent,
	isElement
} = createCommonMethods(ReactLite);

export {
	createElement,
	defineComponent,
	isElement,
	render,
	Constraints
};

function render(content, targetNode) {
    if (!isElement(content)) {
        throw new TypeError(
            "[mount] First argument 'content' has to be a valid element");
    }

    const target = typeof targetNode === 'string'
        ? document.getElementById(targetNode)
        : targetNode;

    return ReactLite.render(content, target);
}
