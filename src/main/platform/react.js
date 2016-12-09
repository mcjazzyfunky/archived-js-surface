import defineExtComponent from '../core/defineExtComponent.js';
import Types from '../util/Types.js';
import Emitter from '../util/Emitter.js';

export function getExports(React) {
	const exports = { Types};

	exports.defineComponent = function (config) {
		return defineExtComponent(config, defineReactComponent);
	};

	exports.createElement = React.createElement;

	exports.isElement = function (what)  {
	    return what !== undefined && what !== null && React.isValidElement(what);
	};

	function defineReactComponent(config) {
	    let ret = null,

	        propNames = config.properties
	            ? Object.getOwnPropertyNames(config.properties)
	            : [];

	    if (config.process) {
	        if (config.properties) {
	            const hasInjectedProps = !propNames.every(
	                propName => !config.properties[propName].inject);

	            if (true || !hasInjectedProps) {
	                ret = props => {
	                    return config.process(props);
	                };

	                ret.displayName = config.name;
	            }
	        }
	    }

	    if (!ret) {
	        const constructor = function (...args) {
	            SurfaceReactComponent.call(this, config, args);
	        };

	        constructor.prototype = Object.create(SurfaceReactComponent.prototype);
	        constructor.displayName = config.name;

	        if (config.properties) {
	            for (let propName of propNames) {
	                const inject = !!config.properties[propName].inject;

	                if (inject) {
	                    constructor.contextTypes[propName] = constructor.propTypes[propName];
	                }
	            }
	        }

	        ret = React.createFactory(constructor);
	    }

	    return ret;
	}

	class SurfaceReactComponent extends React.Component {
	    constructor(config, args) {
	        super(...args);

	        this.__config = config;
	        this.__contentToRender = null;
	        this.__propsEmitter = new Emitter();
	        this.__contextEmitter = new Emitter();
	        this.__contentsPublisher = null;
	        this.__contentsSubscription = null;
	        this.__udateTimeout = null;

	        if (config.process) {
	            this.__contentsPublisher =
	                    this.__propsEmitter.map(props => config.process(props));
	        } else {
	            const result = config.initProcess(this.__propsEmitter);

	            this.__contentsPublisher = result.contents;

	            if (result.methods) {
	                for (let methodName in result.methods) {
	                    if (result.methods.hasOwnProperty(methodName)) {
	                        this[methodName] = result.methods[methodName];
	                    }
	                }
	            }
	        }
	    }

	    componentWillMount() {
	        const self = this;

	        var mounted = false;


	        this.__contentsSubscription = this.__contentsPublisher.subscribe({
	            next(value) {
	                self.__contentToRender = value;
	                var content = value;

	                if (mounted) {
	                    	self.forceUpdate();
	                    if (self.__updateTimeout) {
	                    	clearTimeout(self.__updateTimeout);
	                    }
content = self.__contentToRender;
	                    this.__updateTimeout = setTimeout(() => {
	                    	self.__updateTimeout = null;self.__contentToRender = content;window.xxx = content;
	                    	//self.forceUpdate();
	                    }, 0);
	                }
	            },

	            error(err) {
	            	console.error(err);
	            },

	            complete() {
	            }
	        });

	        this.__propsEmitter.next(this.props);
	        mounted = true;
	    }

	    componentDidMount() {
	    }

	    componentWillUnmount() {
	        this.__propsEmitter.complete();
	        this.__contentsSubscription.unsubscribe();
	        this.__contentsSubscription = null;
	        this.__contentsPublisher = null;
	    }

	    componentWillReceiveProps(nextProps) {
		    try {console.log('nextProps', nextProps);
		        this.__propsEmitter.next(nextProps);
		    } catch(e) {
		        console.error(e);
		        throw e;
		    }
		}

	    shouldComponentUpdate() {
	        return false;
	    }

	    render() {
	        if (!window.xxx && !this.__contentToRender) {
	            throw new Error(
	                '[SurfaceReactComponent#render] Something went wrong - '
	                + `no content to render for component '${this.__config.name}'`);
	        }

	        const ret = window.xxx || this.__contentToRender;
	        this.__contentToRender = null;

	        return ret;
	    }

	    toString() {
	        return 'SurfaceReactComponent/class';
    	}
	}

	return exports;
}
