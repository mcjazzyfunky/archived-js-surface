import adaptFunctionComponent from
	'./internal/component/adaptions/adaptFunctionComponent.js';

import adaptGeneralComponent from
	'./internal/component/adaptions/adaptGeneralComponent.js';

import defineClassComponent from './api/defineClassComponent.js';
import defineAdvancedComponent from './api/defineAdvancedComponent.js';

import Constraints from './api/Constraints.js';

import { render as renderInferno } from 'inferno';
import createInfernoElement from 'inferno-create-element';
import InfernoComponent from 'inferno-component';

//import defineMessages from './api/defineMessages.js';
//import defineStore from './api/defineStore.js';
import hyperscript from './api/hyperscript.js';
import Injector from './api/Injector.js';

export {
	createElement,
	defineAdvancedComponent,
	defineClassComponent,
	defineFunctionComponent,
	defineGeneralComponent,

//	defineMessages,
//	defineStore,
	hyperscript,
	isElement,
	render,
	Constraints,
	Injector
};

function defineFunctionComponent(config) {
	return adaptFunctionComponent(config, adjustedConfig => {
		const ret = props => adjustedConfig.render(props);

		ret.displayName = adjustedConfig.name;

		return ret;
	});
}

function defineGeneralComponent(config) {
	return adaptGeneralComponent(config, adjustedConfig => {
		return (...args) => {
			let viewToRender = null;

			const
				{ sendProps, methods } = adjustedConfig.initProcess(
					view => { viewToRender = view; });

			class ExtCustomComponent extends CustomComponent {
				constructor(...args) {
					super(args, config, sendProps, () => viewToRender);

					if (methods) {
						Object.assign(this, methods);
					}
				}
			}

			ExtCustomComponent.displayName = config.name;
			return createElement(ExtCustomComponent, ...args);
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

function isElement(it) {
    return it !== undefined
        && it !== null
        && typeof it === 'object'
        && !!(it.flags & (28 | 3970 )); // 28: component, 3970: element
}

function render(content, targetNode) {
    if (!isElement(content)) {
        throw new TypeError(
            "[render] First argument 'content' has to be a valid element");
    }

    const target = typeof targetNode === 'string'
        ? document.getElementById(targetNode)
        : targetNode;

    renderInferno(content, target);
}

class CustomComponent extends InfernoComponent {
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
		this.__sendProps(undefined);
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
