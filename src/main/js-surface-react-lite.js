import { createCommonMethods } from './platform/react.js';
import Constraints from './core/Constraints.js';
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
	mount,
	Constraints
};

function mount(content, targetNode) {
    if (!isElement(content)) {
        throw new TypeError(
            "[mount] First argument 'content' has to be a valid element");
    }

    const target = typeof targetNode === 'string'
        ? document.getElementById(targetNode)
        : targetNode;

    return ReactLite.render(content, target);
}
