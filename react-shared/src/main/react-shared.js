import Emitter from '../../../util/src/main/Emitter.js';
import React from 'react';

export {
    createElement,
    defineComponent,
    isElement
};

// Support both: React and Preact
const
    createElement = React.createElement || React.h,
    
    //createReactFactory = React.createFactory || (constructor =>
    //    (props, ...children) => createElement(constructor, props, ...children)),

    createReactFactory = React.createFactory
        || (type => createElement.bind(null, type)),

    VNode  = !React.h ? null : React.h('').constructor,

    isValidReactElement = React.isValidElement
        || (what => what  && (what instanceof React.Component || what instanceof VNode));


function isElement(what)  {
    return what !== undefined && what !== null && isValidReactElement(what);
} 

function defineComponent(config) {
    let ret = null,
    
        propNames = config.properties
            ? Object.getOwnPropertyNames(config.properties)
            : [];

    if (config.render) {
        if (config.properties) {
            const hasInjectedProps = !propNames.every(
                propName => !config.properties[propName].inject);
            
            if (false && !hasInjectedProps) {
                ret = props => {
                    return config.render(props);
                }; 
                
                ret.displayName = config.name;
            }
        }  
    }
    
    if (!ret) {
        const constructor = function (...args) {
            ReactComponent.call(this, config, args);
        };
    
        constructor.prototype = Object.create(ReactComponent.prototype);
        constructor.displayName = config.name;
    
        if (config.properties) {    
            for (let propName of propNames) {
                const inject = !!config.properties[propName].inject;
                    
                if (inject) {
                    constructor.contextTypes[propName] = constructor.propTypes[propName];
                }
            }
        }

        ret = createReactFactory(constructor);
    }
    
    return ret;
} 

class ReactComponent extends React.Component {
    constructor(config, args) {
        super(...args);

        this.__config = config;
        this.__contentToRender = null;
        this.__propsEmitter = new Emitter();
        this.__contextEmitter = new Emitter();
        this.__viewsPublisher = null;
        this.__viewsSubscription = null;
if (config.name ==='FKPaginationInfo') {
    console.log(config)
}
        if (config.render) {
            this.__viewsPublisher =
                    this.__propsEmitter.map(props => config.render(props));
        } else {
            const result = config.initialize(this.__propsEmitter);

            this.__viewsPublisher = result.views;
            
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
        this.__propsEmitter.complete();
        this.__viewsSubscription.unsubscribe();
        this.__viewsSubscription = null;
        this.__viewsPublisher = null;
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
                '[ReactComponent#render] Something went wrong - '
                + `no content to render for component '${this.__config.name}'`);
        }

        const ret = this.__contentToRender;
        this.__contentToRender = null;
        
        return ret;
    }

    toString() {
        return 'ReactComponent/class';
    }
}
