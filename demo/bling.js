'use strict';

import {Observable, Subject} from 'rxjs';
import React from 'react';
import ReactDOM from 'react-dom';

const dummyObject = {};


const tagNames = [
        'a',
        'abbr',
        'acronym',
        'address',
        'applet',
        'area',
        'article',
        'aside',
        'audio',
        'b',
        'base',
        'basefont',
        'bdi',
        'bdo',
        'bgsound',
        'big',
        'blink',
        'blockquote',
        'body',
        'br',
        'button',
        'canvas',
        'caption',
        'center',
        'cite',
        'code',
        'col',
        'colgroup',
        'command',
        'content',
        'data',
        'datalist',
        'dd',
        'del',
        'details',
        'dfn',
        'dialog',
        'dir',
        'div',
        'dl',
        'dt',
        'element',
        'em',
        'embed',
        'fieldset',
        'figcaption',
        'figure',
        'font',
        'footer',
        'form',
        'frame',
        'frameset',
        'head',
        'header',
        'hgroup',
        'hr',
        'html',
        'i',
        'iframe',
        'image',
        'img',
        'input',
        'ins',
        'isindex',
        'kbd',
        'keygen',
        'label',
        'legend',
        'li',
        'link',
        'listing',
        'main',
        'map',
        'mark',
        'marquee',
        'menu',
        'menuitem',
        'meta',
        'meter',
        'multicol',
        'nav',
        'nobr',
        'noembed',
        'noframes',
        'noscript',
        'object',
        'ol',
        'optgroup',
        'option',
        'output',
        'p',
        'param',
        'picture',
        'plaintext',
        'pre',
        'progress',
        'q',
        'rp',
        'rt',
        'rtc',
        'ruby',
        's',
        'samp',
        'script',
        'section',
        'select',
        'shadow',
        'small',
        'source',
        'spacer',
        'span',
        'strike',
        'strong',
        'style',
        'sub',
        'summary',
        'sup',
        'table',
        'tbody',
        'td',
        'template',
        'textarea',
        'tfoot',
        'th',
        'thead',
        'time',
        'title',
        'tr',
        'track',
        'tt',
        'u',
        'ul',
        'var',
        'video',
        'wbr',
        'xmp'
    ];





export const Component = {
    createFactory(config) {
        const configError = checkComponentFactoryConfig(config);
        
        if (configError) {
            throw new TypeError(
                    '[Component.createFactory] '
                    + configError.getMessage());
        } 
        
        const ret = (initialProps, children) => (initialProps === dummyObject)
                ? dummyObject
                : {
                    isBlingComponent: true,
                    typeId: config.typeId,
                    initialProps,
                    children: children || null
                };
    
        ret.getConfig = () => config;
        return ret;
    },

    isFactory(componentFactory) {
        return typeof componentFactory === 'function'
                && typeof componentFactory.getConfig === 'function'
                && componentFactory(dummyObject) === dummyObject;
    }
}

export class ComponentAdapter {
    constructor(id) {
        const idRegex = /^[A-Z][a-zA-Z0-9]*$/;
        
        if (typeof id !== 'string' && !id.matches(idRegex)) {
            throw new TypeError(
                '[ComponentAdapter.constructor] '
                + 'First argument must be a proper adapter id matching the regex '
                + idRegex);
        }
        
        this.__id = id;
    }
    
    getId() {
        return this.__id;
    }

    createElement(tagName, props, children) {
        throw new Error(
            '[ComponentAdapter:createElement] '
            + 'Method not implemented/overridden');
    }

    convertComponentFactory(componentFactory, componentMgr) {
        throw new Error(
            '[ComponentAdapter:convertComponentFactory] '
            + 'Method not implemented/overridden');        
    }
}

function checkComponentFactoryConfig(config) {
    var ret;
    
    const typeIdRegex = /^[A-Z][a-z0-9]*$/;
    
    if (config === null || typeof config !== 'object') {
        ret = new TypeError('Component configuration has to of type {typeId : String, view: Function}');
    } else if (config.typeId === undefined  || config.typeId === null) {
        ret = new TypeError("Component configuration value 'typeId' is missing");
    } else if (typeof config.typeId !== 'string' || !config.typeId.match(typeIdRegex)) {
        ret = new TypeError(`Illegal value for 'typeID' (must match regex ${typeIdRegex})`);
    } else if (config.view === undefined || config.view === null) {
        ret = new TypeError("Component configuration value 'view' is missing");
    } else if (typeof config.view !== 'function') {
        ret = new TypeError("Component configuration value 'view' has to be a function");
    } else {
        ret = null;
    }
    
    return ret;
}


class ComponentMgr {
    constructor() {
        this.__factoryRegistry = new Map();
        this.__adapterRegistry = new Map();
        this.__convertRegistry = new Map();
        this.__uiBuilderRegistry = new Map();
    }

    registerComponentFactory(componentFactory) {
        if (!Component.isFactory(componentFactory)) { 
            throw new TypeError(
                    '[ComponentMgr.registerComponentFactory] '
                    + "First argument must be a proper component factory created by 'Component.createFactory'");
        }
       
        const config = componentFactory.getConfig();
        
        if (this.__factoryRegistry.has(config.typeId)) {
            throw new Error(
                "[CompnentMgr:registerComponentFactory] Component factory with id '"
                + config.typeId
                + "' has already been registered");
        }

        this.__factoryRegistry.set(config.typeId, componentFactory);
    }
    
    registerAdapter(adapter) {
        if (!(adapter instanceof ComponentAdapter)) {
            throw new TypeError(
                    '[ComponentMgr::registerAdapter] '
                    + 'First argument must be a component adapter');
        } else if (this.__adapterRegistry.has(adapter.getId())) {
            throw new Error(
                "[CompnentMgr:registerAdapter] Adapter with id '"
                + adapter.getId()
                + "' has already been registered");
        }
        
        this.__adapterRegistry.set(adapter.getId(), adapter);
    }
    
    getComponentFactory(typeId) {
        const componentFactory = this.__factoryRegistry.get(typeId);
        
        if (!componentFactory) {
            throw new Error(
                "[ComponentMgr:getComponentConfig] Component factory with id '"
                + typeId
                + "' has not been registered");
        }
        
        return componentFactory;
    }
    
    convertComponentFactory(typeId, adapterId) {
        const convertId = `${typeId}/${adapterId}`;

        let ret = this.__convertRegistry.get(convertId);

        if (!ret) {
            const
                componentFactory = this.__factoryRegistry.get(typeId),
                adapter = this.__adapterRegistry.get(adapterId);

            if (!componentFactory) {
                throw new Error(
                    "[ComponentMgr:convertComponentFactory] Component factory with id '"
                    + typeId
                    + "' has not been registered");
            } else if (!adapter) {
                throw new Error(
                    "[ComponentMgr:convertComponentFactory] Adapter with id '"
                    + adapterId
                    + "' has not been registered");
            }
            
            ret = adapter.convertComponentFactory(componentFactory, this);
            this.__convertRegistry.set(convertId, ret);
        }
        
        return ret; 
    }
    
    isComponentFactoryRegistered(typeId) {
        return this.__factoryRegistry.has(typeId);
    }
    
    getUIBuilder(adapterId) {
        let ret = this.__uiBuilderRegistry.get(adapterId);
        
        if (!ret) {
            const adapter = this.__adapterRegistry.get(adapterId);
        
            if (!adapter) {
                throw new Error(
                        "[ComponentMgr.getUIBuilder] No adapter with id '"
                        + adapterId
                        + "' registered"); 
            }
            
            ret = {};

            for (let tagName of tagNames) {
                ret[tagName] = (props, ...children) => {
                    const mappedChildren = children.map(child => {
                        var ret;
                        
                        if (child === null || typeof child !== 'object' || child.isBlingComponent !== true) {
                            ret = child;
                        } else {
                            const
                                factory = mgr.getComponentFactory(child.typeId),
                                config = factory.getConfig(),
                                typeId = config.typeId;
                            
                            const convert = mgr.convertComponentFactory(typeId, adapterId);
                            ret = convert(child.initialProps, child.children);
                        }
                        
                        return ret;
                    });
                    
                    return adapter.createElement(tagName, props, mappedChildren);
                };
            }
            
            return ret;
        } 
    }
    
    static getGlobal() {
        let ret = this.__globalInstance;
        
        if (!ret) {
            ret = this.__globalInstance = new ComponentMgr();
        }
        
        return ret;
    }
}

export class EventMgr {
    constructor() {
        const subjectsByName = new Map();
    
        this.on = (eventName) => {
            let ret = subjectsByName.get(eventName);
            
            if (!ret) {
                ret = new Subject(); 
                subjectsByName.set(eventName, ret);
            }
            
            return ret.asObservable();
        }    
        
        this.bind = (eventName) => {
            let subject = subjectsByName.get(eventName);

            if (!subject) {
                subject = new Subject(); 
                subjectsByName.set(eventName, subject);
            }
            
            return event => subject.next(event);
        }
    }
    
    on(eventName) {
        throw Error('[EventMgr:on] Method not implemented');
    }
    
    bind(eventName) {
        throw Error('[EventMgr:bind] Method not implemented');
    }
}

export const button = Component.createFactory({
    id: 'Button',

    defaultProps: {
        caption: ''
    },
    
    view(dom, propsObs) {
        const
            {on, bind} = new EventMgr(),
            buttonClickedObs = on('buttonClicked');
        
        return {
            display: propsObs.map(props => {
                return dom.button({
                        className: 'ui-button',
                        onClick: bind('buttonClicked') 
                    },
                    props.get('text'));
            }),
            events: {
                click: buttonClickedObs
            }
        };
    }
});

// [-] 42 [+]
export const counter = Component.createFactory({
    id: 'Counter',
    
    defaultProps: {
        caption: ''  
    },
    
    view: (dom, propsObs) => {
        const
            {on, bind} = new EventMgr(),

            plusObs = on('plusButtonClicked')
                    .map(_ => 1),

            minusObs = on('minusButtonClicked')
                    .map(_ => -1),

            counterObs = Observable.merge(plusObs, minusObs)
                    .startWith(0)
                    .scan((prev, curr) => prev + curr);
        
        return {
            display: Observable.combineLatest(propsObs, counterObs, (props, counter) => {
                const ret = dom.div(
                    {className: 'ui-counter'},
                    
                    dom.label(
                        {className: 'ui-counter-label'},
                        props.get('caption')
                    ),
                    button({
                        className: 'ui-counter-decrement',
                        text: '-',
                        onClick: bind('minusButtonClicked')
                    }),
                    dom.span(
                        {className: 'ui-counter-value'},
                         counter
                    ),
                    button({
                        className: 'ui-counter-increment',
                        text: '+',
                        onClick: bind('plusButtonClicked')
                    }) 
                );
                
                return ret;
            }),
    
            events: {
                update: counterObs.skip(1)
                        .map(state => {counter: state})
            }
        };
    }
});

class ReactAdapter extends ComponentAdapter {
    constructor() {
        super('ReactAdapter');
    }
    
    createElement(tagName, props, children) {
        return React.createElement(tagName, props, ...children); // TODO '...'
    }
    
    convertComponentFactory(componentFactory, componentMgr) {
        if (!Component.isFactory(componentFactory)) {
            throw new TypeError(
                '[ReactAdapter:convertComponentFactory] '
                + 'First argument must be a proper component factory created by '
                + "'Component.createFactory'");
        } else if (!(componentMgr instanceof ComponentMgr)) {
            throw new TypeError(
                '[ReactAdapter:convertComponentFactory] '
                + 'Second argument must be a component manager');
        }
        
        const
            config = componentFactory.getConfig(),
            constructor = function () {ReactComponent.call(this, componentFactory,componentMgr)};
            
        constructor.displayName = config.typeId;
        constructor.prototype = ReactComponent.prototype;// new ReactComponent(componentFactory, componentMgr);
        return React.createFactory(constructor);
    }
}

class Reader {
    constructor(obj) {
        this.__obj = obj || {};
    }
    
    get(key) {
        return this.__obj[key];
    }
}


class ReactComponent extends React.Component {
    constructor(componentFactory, componentMgr) {
       if (!Component.isFactory(componentFactory)) {
            throw new TypeError(
                '[ReactAdapter.constructor] '
                + 'First argument must be a proper component factory created by '
                + "'Component.createFactory'");
        } else if (!(componentMgr instanceof ComponentMgr)) {
            throw new TypeError(
                '[ReactComponent.constructor] '
                + 'Second argument must be a component manager');
        }        
        
        super();
        
        const config = componentFactory.getConfig();
        this.__needsToBeRendered = false;
        this.__propsSbj = new Subject();
        this.__subscriptionViewDisplay = null;
        this.__subscriptionViewEvents = null;
        
        const view = config.view(
            componentMgr.getUIBuilder('ReactAdapter'), // TODO
            this.__propsSbj);

        this.__viewDisplayObs = view.display;
        this.__viewEvents = view.events;

        this.__viewDisplayObs.subscribe(domTree => {
            this.__domTree = domTree;
            this.__needsToBeRendered = true;
            
            setTimeout(() => {
                if (this.__needsToBeRendered) {
                    this.forceUpdate();
                    //this.setState({});
                }
            }, 0);
        });
        
        if (this.__viewEvents !== null && typeof this.__viewEvents === 'object') {
            Object.keys(this.__viewEvents).forEach(key => {
                const obs = this.__viewEvents[key];
                
                if (key.length > 0 && obs instanceof Observable) {
                    obs.subscribe(event => {
                        if (this.props) {
                            const
                                attr = 'on' + key[0].toUpperCase() + key.substr(1),
                                callback = this.props.get(attr);
                            
                            
                            if (typeof callback === 'function') {
                                callback(event);
                            }
                        }
                    });
                } 
            });
        }
        
        this.__hasInitialized = false;
    }
   
    componentWillUnmount() {
        //this.__subscription.unsubscribe();
    }
    
    componentWillReceiveProps(nextProps) {
        this.props = new Reader(nextProps);
        this.__propsSbj.next(this.props);
    }
    
    shouldComponentUpdate() {
        return this.__needsToBeRendered;
    }
    
    render() {
        if (!(this.props instanceof Reader)) {
            this.props = new Reader(this.props);
        }
        if (!this.__hasIniialized) {
            this.__hasIniialized = true;
            this.__propsSbj.next(this.props);
        }

        const ret = this.__domTree;
        //this.__domTree = null;
        this.__needsToBeRenderd = false;
        return ret;
    }
}


const mgr = ComponentMgr.getGlobal();
    
mgr.registerComponentFactory(button);
mgr.registerComponentFactory(counter);
mgr.registerAdapter(new ReactAdapter())


const Counter = mgr.convertComponentFactory('Counter', 'ReactAdapter');
const Button = mgr.convertComponentFactory('Button', 'ReactAdapter');

setTimeout(() => {
    ReactDOM.render(React.createElement('div', null, Counter({xxxonUpdate: (event) => alert(event),text: 'press me'})), document.getElementById('content'));
}, 0);



