import Emitter from '../../../util/src/main/Emitter.js';

import Inferno from 'inferno';
import createElement from 'inferno-create-element';
import Component from 'inferno-component';

export {
    createElement,
    defineComponent,
    isElement,
    mount
};

function isElement(what) {
    return what !== undefined && what !== null && what !== false;
}


function mount(content, targetNode) {
    if (!isElement(content)) {
        throw new TypeError(
            "[mount] First argument 'content' has to be a valid element");
    }

    if (typeof targetNode === 'string') {
        targetNode = document.getElementById(targetNode);
    }

    Inferno.render(content, targetNode);
}


function defineComponent(config) {
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
            InfernoComponent.call(this, config, args);
        };
    
        constructor.prototype = Object.create(InfernoComponent.prototype);
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
    
        ret = (props, ...children) => createElement(constructor, props, ...children);
    }
    
    return ret;
} 


class InfernoComponent extends Component {
    constructor(config, args) {
        super(...args);

        this.__config = config;
        this.__contentToRender = null;
        this.__propsEmitter = new Emitter();
        this.__contextEmitter = new Emitter();
        this.__viewsPublisher = null;
        this.__viewsSubscription = null;

        if (config.render) {
            this.__viewsPublisher =
                this.__propsEmitter.map(props => config.render(props));
        } else {
            const { views, methods} = config.initialize(this.__propsEmitter);
            
            this.__viewsPublisher = views;

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

        
        this.__viewsSubscription = this.__viewsPublisher.subscribe({
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
        this.__viewsSubscription.unsubscribe();
        this.__viewsSubscription = null;
        this.__viewsSubscription = null;
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