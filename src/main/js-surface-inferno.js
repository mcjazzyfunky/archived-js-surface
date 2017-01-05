import adaptFunctionalComponentDefinition from
	'./internal/component/adaptFunctionalComponentDefinition.js';

import createPropsAdjuster from './internal/component/createPropsAdjuster.js';
import Constraints from './api/Constraints.js';

import { render as renderInferno } from 'inferno';
import createInfernoElement from 'inferno-create-element';
import InfernoComponent from 'inferno-component';

import defineMessages from './api/defineMessages.js';
import defineStore from './api/defineStore.js';

export {
	createElement,
	defineAdvancedComponent,
	defineFunctionalComponent,
	defineGeneralComponent,
	defineMessages,
	defineStandardComponent,
	defineStore,
	isElement,
	render,
	Constraints
};

function defineFunctionalComponent(config) {
	return adaptFunctionalComponentDefinition(config, adjustedConfig => {
		const ret = props => config.render(props);

		ret.displayName = adjustedConfig.name;

		return ret;
	});
}

function defineGeneralComponent(config) {
	const ExtCustomComponent = function (args, sendProps, getView) {
		CustomComponent.apply(this, args, config, sendProps, getView);
	};

	ExtCustomComponent.displayName = config.name;

	return defComp(config, config => {
		return (...args) => {
			let viewToRender = null;

			const
				{ sendProps, methods } = config.initControl(
					view => { viewToRender = view; }),

				component = new ExtCustomComponent(
					args, sendProps, () => viewToRender);

			return Object.assign(component, methods);
		};
	});
}

function defineStandardComponent(config) {
	const ExtCustomComponent = function (args, sendProps, getView) {
		CustomComponent.apply(this, args, config, sendProps, getView);
	};

	ExtCustomComponent.displayName = config.name;

	return defComp(config, config => {
		return (...args) => {
			let viewToRender = null;

			const
				{ sendProps, methods } = config.initControl(
					view => { viewToRender = view; }),

				component = new ExtCustomComponent(
					args, sendProps, () => viewToRender);

			return Object.assign(component, methods);
		};
	});
}

function defineAdvancedComponent(config) {
	// TODO
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
            "[mount] First argument 'content' has to be a valid element");
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
