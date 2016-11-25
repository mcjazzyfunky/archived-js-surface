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
    constructor.defaultProps = {};
    
    const propNames = Object.getOwnPropertyNames(config.properties);
    
    for (var propName of propNames) {
        const defaultValue = config.properties[propName].defaultValue;
       
        if (defaultValue !== undefined) {
            constructor.defaultProps[propName] = defaultValue;
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

        const result = config.initialize(
            this.__propsEmitter,
            this.__contextEmitter);
        
        this.__viewsPublisher = result.views;
        this.__viewsSubscription = null;
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
        this.__mounted = false;
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

    /**
     * @ignore
     */
    toString() {
        return 'ReactComponent/class';
    }
}
