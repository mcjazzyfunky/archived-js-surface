import Constraints from './api/Constraints.js';
import Component from './api/Component.js';

import { createCommonMethods } from './internal/react/react.js';
import React from 'react';
import ReactDOM from 'react-dom';

import defineClassComponent from './api/defineClassComponent.js';
import defineAdvancedComponent from './api/defineAdvancedComponent.js';
import hyperscript from './api/hyperscript.js';

const {
	createElement,
	defineFunctionComponent,
	defineGeneralComponent,
	isElement
} = createCommonMethods(React);

export {
	createElement,
	defineAdvancedComponent,
	defineClassComponent,
	defineFunctionComponent,
	defineGeneralComponent,

//	defineMessages,
//	defineStandardComponent,
//	defineStore,
	hyperscript,
	isElement,
	render,
	Component,
	Constraints,
//	Injector
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
