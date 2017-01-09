import { createCommonMethods } from './internal/react/react.js';

import defineStandardComponent from './api/defineStandardComponent.js';
import defineAdvancedComponent from './api/defineAdvancedComponent.js';
import hyperscript from './api/hyperscript.js';
import Component from './api/Component.js';
import Constraints from './api/Constraints.js';

import ReactLite from 'react-lite';

const {
	createElement,
	defineFunctionalComponent,
	defineBasicComponent,
	isElement
} = createCommonMethods({
	Component: ReactLite.Component,
	createElement: ReactLite.createElement,
	createFactory: ReactLite.createFactory,
	isValidElement: ReactLite.isValidElement
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
