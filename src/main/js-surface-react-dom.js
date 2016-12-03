import { getExports } from './platform/react.js';
import React from 'react';
import ReactDOM from 'react-dom';

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
