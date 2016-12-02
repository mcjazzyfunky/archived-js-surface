import defineExtComponent from '../../../core/src/main/defineExtComponent.js';
import defineIntents from '../../../util/src/main/defineIntents.js';
import Types from '../../../util/src/main/Types.js';
import Emitter from '../../../util/src/main/Emitter.js';

export function getExports({ InfernoComponent, createInfernoElement, renderInferno }) {
	const exports = { defineIntents, Types};

	exports.defineComponent = function (config) {
		return defineExtComponent(config, defineInfernoComponent);
	};

	exports.createElement = function (tag, props, ...children)  {
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
	};


	exports.isElement = function (what) {
	    return what !== undefined
	        && what !== null
	        && typeof what === 'object'
	        && !!(what.flags & (28 /* Component */ | 3970 /* Element */));
	};


	exports.mount = function (content, targetNode) {
	    if (!exports.isElement(content)) {
	        throw new TypeError(
	            "[mount] First argument 'content' has to be a valid element");
	    }

	    if (typeof targetNode === 'string') {
	        targetNode = document.getElementById(targetNode);
	    }

	    renderInferno(content, targetNode);
	};


	function defineInfernoComponent(config) {
	    let ret = null;

	    const propNames = config.properties
	        ? Object.getOwnPropertyNames(config.properties)
	        : [];

	    if (config.render) {
	        let hasInjectedProps = config.properties
	            && !propNames.every(propName => !config.properties[propName].inject);

	        if (false && !hasInjectedProps) {
	            ret = props => {
	                return config.render(props);
	            };

	            ret.displayName = config.name;
	        }
	    }

	    if (!ret) {
	        const constructor = function (...args) {
	            SurfaceInfernoComponent.call(this, config, args);
	        };

	        constructor.prototype = Object.create(SurfaceInfernoComponent.prototype);
	        constructor.displayName = config.name;
	        constructor.contextTypes = {};

	        if (config.properties) {
	            for (let propName of propNames) {
	                const inject = !!config.properties[propName].inject;

	                if (inject) {
	                    constructor.contextTypes[propName] = constructor.propTypes[propName];
	                }
	            }
	        }

	        ret = (props, ...children) => exports.createElement(constructor, props, ...children);
	    }

	    return ret;
	}


	class SurfaceInfernoComponent extends InfernoComponent {
	    constructor(config, args) {
	        super(...args);

	        this.__config = config;
	        this.__contentToRender = null;
	        this.__propsEmitter = new Emitter();
	        this.__contextEmitter = new Emitter();
	        this.__contentsPublisher = null;
	        this.__contentsSubscription = null;

	        if (config.process) {
	            this.__contentsPublisher =
	                this.__propsEmitter.map(props => config.process(props));
	        } else {
	            const { contents, methods} = config.initProcess(this.__propsEmitter);

	            this.__contentsPublisher = contents;

	            if (methods) {
	                for (let methodName in methods) {
	                    if (methods.hasOwnProperty(methodName)) {
	                        this[methodName] = methods[methodName];
	                    }
	                }
	            }
	        }
	    }

	    componentWillMount(params) {
	        const self = this;

	        var mounted = false;


	        this.__contentsSubscription = this.__contentsPublisher.subscribe({
	            next(value) {
	                self.__contentToRender = value;

	                if (mounted) {
	                    self.forceUpdate();
	                }
	            }
	        });

	        this.__propsEmitter.next(this.props);
	        mounted = true;
	    }

	    componentDidMount() {
	    }

	    componentWillUnmount() {
	        this.__mounted = false;
	        this.__contentsSubscription.unsubscribe();
	        this.__contentsSubscription = null;
	        this.__contentsSubscription = null;
	    }

	    componentWillReceiveProps(nextProps) {
	        this.__propsEmitter.next(nextProps);
	    }

	    shouldComponentUpdate() {
	        return !!this.__contentToRender;
	    }

	    render() {
	        if (!this.__contentToRender) {
	            throw new Error(
	                '[InfernoComponent#render] Something went wrong - '
	                + `no content to render for component '${this.__config.name}'`);
	        }

	        const ret = this.__contentToRender;
	        this.__contentToRender = null;

	        return ret;
	    }

	    toString() {
	        return 'InfernoComponent/class';
	    }
	}


	return exports;
}
