import Constraints from './core/Constraints.js';
import { getExports } from './platform/react.js';
import Preact from 'preact';

const
   createElement = Preact.h,
   VNode  = Preact.h('').constructor;

const {
	defineComponent,
	isElement,
} = getExports({
	Component: Preact.Component,
	createElement,
	createFactory,
	isValidElement
});

export {
	createElement,
	defineComponent,
	isElement,
	mount,
	Constraints
};

function createFactory() {
	return type => createElement.bind(null, type);
}

function isValidElement(what) {
	return what !== undefined && what !== null
		&& (typeof what !== 'object'|| what instanceof VNode);
}

function mount(content, targetNode) {
    if (!isElement(content)) {
        throw new TypeError(
            "[mount] First argument 'content' has to be a valid element");
    }

    if (typeof targetNode === 'string') {
        targetNode = document.getElementById(targetNode);
    }

    return Preact.render(content, targetNode);
}
