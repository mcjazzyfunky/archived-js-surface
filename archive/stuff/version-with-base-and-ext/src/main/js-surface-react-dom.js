import { getExports } from './platform/react.js';
import React from 'react';
import ReactDOM from 'react-dom';

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
