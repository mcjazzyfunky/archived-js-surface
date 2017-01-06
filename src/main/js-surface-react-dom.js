import Constraints from './api/Constraints.js';
import { createCommonMethods } from './internal/react/react.js';
import React from 'react';
import ReactDOM from 'react-dom';

const {
	createElement,
	defineComponent,
	isElement
} = createCommonMethods(React);

export {
	createElement,
	defineAdvancedComponent,
	defineFunctionalComponent,
	defineGeneralComponent,
	defineMessages,
	defineStandardComponent,
	defineStore,
	hyperscript,
	isElement,
	render,
	Constraints,
	Injector
};

function render(content, targetNode) {
    if (!isElement(content)) {
        throw new TypeError(
            "[mount] First argument 'content' has to be a valid element");
    }

    if (typeof targetNode === 'string') {
        targetNode = document.getElementById(targetNode);
    }

    return ReactDOM.render(content, targetNode);
}
