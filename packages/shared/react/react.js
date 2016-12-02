import Emitter from '../../../util/src/main/Emitter.js';
import React from 'react';

export {
    createElement,
    defineReactComponent,
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

function defineReactComponent(config) {
    let ret = null,

        propNames = config.properties
            ? Object.getOwnPropertyNames(config.properties)
            : [];

    if (config.process) {
        if (config.properties) {
            const hasInjectedProps = !propNames.every(
                propName => !config.properties[propName].inject);

            if (false && !hasInjectedProps) {
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

        ret = createReactFactory(constructor);
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
        this.__contentsSubscription.unsubscribe();
        this.__contentsSubscription = null;
        this.__contentsPublisher = null;
    }

    componentWillReceiveProps(nextProps) {
    try {
        this.__propsEmitter.next(nextProps);
    } catch(e) {
        console.error(e);
        throw e;
    }
    }

    shouldComponentUpdate() {
        return !!this.__contentToRender;
    }

    render() {
        if (!this.__contentToRender) {
            throw new Error(
                '[SurfaceReactComponent#render] Something went wrong - '
                + `no content to render for component '${this.__config.name}'`);
        }

        const ret = this.__contentToRender;
        this.__contentToRender = null;

        return ret;
    }

    toString() {
        return 'SurfaceReactComponent/class';
    }
}
