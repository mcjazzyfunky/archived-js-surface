import predefineComponent from './core/predefineComponent.js';
import Constraints from './core/Constraints.js';

import { render as renderInferno } from 'inferno';
import createInfernoElement from 'inferno-create-element';
import InfernoComponent from 'inferno-component';

export {
	createElement,
	defineComponent,
	isElement,
	mount,
	Constraints
}

function defineComponent(config) {
	return predefineComponent(config, config => {
		return (...args) => {


			return new CustomInfernoComponent(
				args, config, sendProps, getView);
		};
	});
}

function createElement(tag, props, ...children)  {
    // TODO: For performance reasons
    if (tag === undefined || tag === null) {
        throw new TypeError(
            '[createElement] '
            + "First argument 'tag' must not be undefined or null");
    }

    let ret;

    if (!children) {
        ret = createInfernoElement.apply(null, arguments);
    } else {
        const newArguments = [tag, props];

        for (let child of children) {
            if (child && !Array.isArray(child) && typeof child[Symbol.iterator] === 'function') {
                newArguments.push(Array.from(child));
            } else {
                newArguments.push(child);
            }
        }

        ret = createInfernoElement.apply(null, newArguments);
    }

    return ret;
}


function isElement(what) {
    return what !== undefined
        && what !== null
        && typeof what === 'object'
        && !!(what.flags & (28 /* Component */ | 3970 /* Element */));
}


function mount(content, targetNode) {
    if (!exports.isElement(content)) {
        throw new TypeError(
            "[mount] First argument 'content' has to be a valid element");
    }

    if (typeof targetNode === 'string') {
        targetNode = document.getElementById(targetNode);
    }

    renderInferno(content, targetNode);
}


class CustomInfernoComponent extends InfernoComponent {
    constructor(superArgs, config, sendProps, getView) {
        super(...superArgs);

        this.__config = config;
        this.__sendProps = sendProps;
        this.__getView = getView;
    }

    componentWillMount() {
    	this.__sendProps(this.props);
    }

    componentWillUnmount() {
		this.__sendProps(null);
    }

    componentWillReceiveProps(nextProps) {
    	this.__sendProps(nextProps);
    }

    shouldComponentUpdate() {
    	return false;
    }

    render() {
    	return this.__getView();
    }
}
