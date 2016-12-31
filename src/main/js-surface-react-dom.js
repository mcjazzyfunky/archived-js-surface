import Constraints from './core/Constraints.js';
import { createCommonMethods } from './platform/react.js';
import React from 'react';
import ReactDOM from 'react-dom';

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

function mount(content, targetNode) {
    if (!isElement(content)) {
        throw new TypeError(
            "[mount] First argument 'content' has to be a valid element");
    }

    if (typeof targetNode === 'string') {
        targetNode = document.getElementById(targetNode);
    }

    return ReactDOM.render(content, targetNode);
}
