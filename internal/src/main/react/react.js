import Emitter from '../../../../internal/src/main/util/Emitter.js';
import React from 'react';

export {
    defineComponent,
    isElement
}

function isElement(what)  {
    return React.isValidElement(what);
} 

function defineComponent(config) {
    const constructor = function (...args) {
        ReactComponent.call(this, config, args);
    };

    constructor.prototype = Object.create(ReactComponent.prototype);
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
//                constructor.defaultProps[propName] = defaultValue;
            }
        }
    }

    return React.createFactory(constructor);
} 

class ReactComponent extends React.Component {
    constructor(config, args) {
        super(...args);

        this.__contentToRender = null;
        this.__propsEmitter = new Emitter();
        this.__contextEmitter = new Emitter();

        const result = config.initialize( this.__propsEmitter);
        
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
        this.__viewsSubscription.unsubscribe();
        this.__viewsSubscription = null;
        this.__viewsPublisher = null;
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
                '[ReactComponent#render] Something went wrong - no content to render');
        }

        const ret = this.__contentToRender;
        this.__contentToRender = null;

        return ret;
    }

    toString() {
        return 'ReactComponent/class';
    }
}
