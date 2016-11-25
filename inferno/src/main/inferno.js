import Emitter from '../../../internal/src/main/util/Emitter.js';

import Inferno from 'inferno';
import createInfernoElement from 'inferno-create-element';
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


function createElement(tag, props, ...children) {
    // TODO: For performance reasons
    if (tag === undefined || tag === null) {
        throw new TypeError(
            '[createElement] '
            + "First argument 'tag' must not be undefined or null");
    }
    
    const
        mappedChildren = [],
        args = [tag, props];
    
    for (let child of children) {
        if (child !== null && typeof child === 'object' && typeof child[Symbol.iterator] === 'function') {
            for (let item of child) {
                args.push(item);
            } 
        } else {
            args.push(child);
        }
    }
        
    return createInfernoElement(...args);
}


function defineComponent(config) {
    const constructor = function (...args) {
        InfernoComponent.call(this, config, args);
    };

    constructor.prototype = Object.create(InfernoComponent.prototype);
    constructor.displayName = config.name;
    constructor.propTypes = {};
    constructor.contextTypes = {};
    constructor.defaultProps = {};

    if (config.properties) {    
        const propNames = Object.getOwnPropertyNames(config.properties);
        
        for (let propName of propNames) {
            const
                type = config.properties[propName].type,
                defaultValue = config.properties[propName].defaultValue,
                implicit = !!config.properties[propName].implcit;

            constructor.propTypes[propName] = type || null;
            
            if (implicit) {
                constructor.contextTypes[propName] = constructor.propTypes[propName];
            }
            
            if (defaultValue !== undefined) {
                constructor.defaultProps[propName] = defaultValue;
            }
        }
    }

    return (props, ...children) => createElement(constructor, props, ...children);
} 


class InfernoComponent extends Component {
    constructor(config, args) {
        super(...args);

        this.__contentToRender = null;
        this.__propsEmitter = new Emitter();
        this.__contextEmitter = new Emitter();

        const result = config.initialize(this.__propsEmitter);
        
        this.__viewsPublisher = result.views;
        this.__viewsSubscription = null;
        
        if (result.methods) {
            for (let methodName in result.methods) {
                if (result.methods.hasOwnProperty(methodName)) {
                    this[methodName] = result.methods[methodName];
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
        return false;
    }

    render() {
        if (!this.__contentToRender) {
            throw new Error(
                '[InfernoComponent#render] Something went wrong - no content to render');
        }

        const ret = this.__contentToRender;
        this.__contentToRender = null;
        
        return ret;
    }

    toString() {
        return 'InfernoComponent/class';
    }
}