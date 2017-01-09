import { createCommonMethods } from './internal/react/react.js';

import defineStandardComponent from './api/defineStandardComponent.js';
import defineAdvancedComponent from './api/defineAdvancedComponent.js';
import hyperscript from './api/hyperscript.js';
import Component from './api/Component.js';
import Constraints from './api/Constraints.js';

import Preact from 'preact';

const {
    createElement = Preact.h,
    VNode  = Preact.h('').constructor,
	defineFunctionalComponent,
	defineBasicComponent,
	isElement
} = createCommonMethods({
	Component: Preact.Component,
	createElement,
	createFactory,
	isValidElement
});

export {
	createElement,
	defineAdvancedComponent,
	defineStandardComponent,
	defineFunctionalComponent,
	defineBasicComponent,
//	defineMessages,
//	defineStore,
	hyperscript,
	isElement,
	render,
	Component,
	Constraints,
//	Injector
};

function createFactory(type) {
	return createElement.bind(null, type);
}

function isValidElement(it) {
	return it !== undefined && it !== null
		&& (typeof it !== 'object'|| it instanceof VNode);
}

function render(content, targetNode) {
    if (!isElement(content)) {
        throw new TypeError(
            "[render] First argument 'content' has to be a valid element");
    }

    if (typeof targetNode === 'string') {
        targetNode = document.getElementById(targetNode);
    }

    return Preact.render(content, targetNode);
}
