import Constraints from './api/Constraints.js';
import Component from './api/Component.js';

import { createCommonMethods } from './internal/react/react.js';
import React from 'react';
import ReactDOM from 'react-dom';

import defineStandardComponent from './api/defineStandardComponent.js';
import defineAdvancedComponent from './api/defineAdvancedComponent.js';
import hyperscript from './api/hyperscript.js';

const {
	createElement,
	defineFunctionalComponent,
	defineBasicComponent,
	isElement
} = createCommonMethods({
	Component: React.Component,
	createElement: React.createElement,
	createFactory: React.createFactory,
	isValidElement: React.isValidElement
});

export {
	createElement,
	defineAdvancedComponent,
	defineStandardComponent,
	defineFunctionalComponent,
	defineBasicComponent,

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
