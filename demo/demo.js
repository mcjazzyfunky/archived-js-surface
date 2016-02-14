'use strict';

import {Observable, Subject} from 'rx';
import React from 'react';
import ReactDOM from 'react-dom';

export const Component = {
    createFactory(config) {
        const configError = checkComponentClassConfig(config);
        
        if (configError) {
            throw new TypeError('[Component.create] ' + configError.getMessage());
        } 
        
        const ret = (initialProps, children) => ({
            isBlingComponent: true,
            classId: config.classId,
            initialProps,
            children
        });
        
        ret.getConfig = () => {
            return config;
        }
        
        return ret;
    }
}

export class ComponentAdapter {
    convertComponentClass(componentClass) {
        throw new Error(
            '[ComponentAdapter:convertComponentClass] '
            + 'Method not implemented/overridden');        
    }
}

function checkComponentClassConfig(config) {
    var ret;
    
    const classIdRegex = /^[A-Z][a-z0-9]*$/;
    
    if (config === null || typeof config !== 'object') {
        ret = new TypeError('Component configuration has to of type {classId : String, view: Function}');
    } else if (config.classId === undefined  || config.classId === null) {
        ret = new TypeError("Component configuration value 'classId' is missing");
    } else if (typeof config.classId !== 'string' || !config.classId.match(classIdRegex)) {
        ret = new TypeError(`Illegal value for 'typeID' (must match regex ${classIdRegex})`);
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
        this.__componentClassRegistry = new Map();
        this.__adapterRegistry = new Map();
        this.__convertRegistry = new Map();
    }

    registerComponentClass(componentClass) {
        if (componentClass === null || typeof componentClass !== 'function' || typeof componentClass.getConfig !== 'function'
                || checkComponentClassConfig(componentClass.getConfig())) {
            throw new TypeError(
                    '[ComponentMgr.registerComponent] '
                    + "First argument must be a proper component class created by 'Component.createClass'");
        }
       
        const config = componentClass.getConfig();
        
        if (this.__componentClassRegistry.has(config.classId)) {
            throw new Error(
                "[CompnentMgr:registerComponent] Component with class id '"
                + config.classId
                + "' has already been registered");
        }

        this.__componentClassRegistry.set(config.classId, config);
    }
    
    registerAdapter(adapterId, adapter) {
        const adapterIdRegex = /^[A-Z][a-zA-Z0-9]*$/;
        
        if (typeof  adapterId !== 'string' || adapterId.match(adapterIdRegex)) {
            throw new TypeError('[ComponentMgr:registerAdapter] '
                + 'First argument must be a proper adapter ID '
                + 'that matches regex '
                + adapterIdRegex);
        } else if (this.__adapterRegistry.has(adapterId)) {
            throw new Error(
                "[CompnentMgr:registerAdapter] Adapter with  "
                + adapterId
                + "' has already been registered");
        }
        
        this.__adapterRegistry.set(adapterId, adapter);
    }
    
    getComponentClass(classId) {
        const componentClass = this.__componentClassRegistry.get(classId);
        
        if (!componentClass) {
            throw new Error(
                "[ComponentMgr:getComponentConfig] Component with class id '"
                + classId
                + "' has not been registered");
        }
        
        return componentClass;
    }
    
    convertComponentClass(classId, adapterId) {
        const convertId = `${classId}/${adapterId}`;
        
        let ret = this.__convertRegistry.get(convertId);

        if (!ret) {
            const
                componentClass = this.__componentClassRegistry.get(classId),
                adapter = this.__adapterRegistry.get(adapterId);

            if (!componentClass) {
                throw new Error(
                    "[ComponentMgr:convertComponent] Component with class id '"
                    + classId
                    + "' has not been registered");
            } else if (!adapter) {
                throw new Error(
                    "[ComponentMgr:convertComponent] Adapter with id '"
                    + adapterId
                    + "' has not been registered");
            }
            
            ret = adapter.convertComponentClass(componentClass);
            this.__convertRegistry.set(convertId, ret);
        }
        
        return ret; 
    }
    
    isComponentClassRegistered(classId) {
        return this.__componentClassRegistry.has(classId);
    }
    
    static getGlobal() {
        let ret = this.__globalInstance;
        
        if (!ret) {
            ret = this.__globalInstance = new ComponentMgr();
        }
        
        return ret;
    }
}

class EventMgr {
    constructor() {
        const subjectsByName = new Map();
    
        this.on = (eventName) => {
            let ret = subjectsByName.get(eventName);
            
            if (!ret) {
                ret = new Subject(); 
                subjectsByName.set(eventName, ret);
            }
            
            return ret.asObserver();
        }    
        
        this.bind = (eventName) => {
            let ret = subjectsByName.get(eventName);

            if (!ret) {
                ret = new Subject(); 
                subjectsByName.set(eventName, ret);
            }
            
            return ret.asObservable();
        }
    }
    
    on(eventName) {
        throw Error('[EventMgr:on] Method not implemented');
    }
    
    bind(eventName) {
        throw Error('[EventMgr:bind] Method not implemented');
    }
}

export const button = Component.createClass({
    classId: 'Button',

    defaultProps: {
        caption: ''
    },
    
    view(dom, propsObs) {
        return {
            display: propsObs.map(props => {
                dom.button(
                    {class: 'component'},
                    props.get('caption'));
            })
        };
    }
});

// [-] 42 [+]
export const counter = Component.createClass({
    classId: 'Counter',
    
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

            counterObs = //Observable.merge(plusObs, minusObs)
                    plusObs.startWith(0)
                    .scan((prev, curr) => prev + curr);

        return {
            display: propsObs.map(props =>
                    dom.div(
                        {className: 'ui-counter'},
                        
                        dom.label(
                            {className: 'ui-counter-label'},
                            props.get('caption')
                        ),
                        dom.button({
                                className: 'ui-counter-decrement',
                                onClick: bind('minusButtonClicked')
                            },
                            '+'
                        ),
                        dom.span(
                            {className: 'ui-counter-value'},
                             "counter"
                        ),
                        dom.button({
                                className: 'ui-counter-increment',
                                onClick: bind('plusButtonClicked')
                            },
                            '-'
                        ))),
    
            events: {
                update: counterObs.map(state => {counter: state})
            }
        };
    }
});

class ReactAdapter extends ComponentAdapter {
    convertComponentClass(componentClass) {
        if (typeof componentClass !== 'function'
                || typeof componentClass.getConfig !== 'function'
                || checkComponentClassConfig(componentClass.getConfig())) {

            throw new TypeError(
                    '[ReactAdapter.convertComponentClass] '
                    + 'First argument must be a proper component class created by '
                    + "'Component.createClass'");
        }
        
        const constructor = function () {};
        constructor.prototype = new ReactComponent(componentClass);
        return React.createFactory(constructor);
    }
}

class Reader {
    constructor(obj) {
        this.__obj = obj;
    }
    
    get(key) {
        return this._obj[key];
    }
}

const domBuilder = {};

class ReactComponent extends React.Component {
    constructor(component) {
        super();
        
        const interaction = {
           on: () => new Observable(),
           bind: () => new Subject()
        };
        
        this.__component = component;
        this.__propsSbj = new Subject();
        this.__subscriptionViewDisplay = null;
        this.__subscriptionViewEvents = null;
        console.log(this.__component);
        const view = this.__component.getConfig().view(
            domBuilder,
            interaction,
            this.__propsSbj);

        this.__viewDisplayObs = view.display;
        this.__viewEvents = view.events;

    }
    
    componentWillMount() {
        this.__viewDisplayObs.subscribe(domTree => {
            this.__domTree = domTree;
            this.forceUpdate();
//            this.__domTree = null;
        });
    }
    
    componentWillUnmount() {
        this.__subscription.unsubscribe();
    }
    
    componentWillReceiveProps(nextProps) {
        this.props = nextProps();
        this.__propsSbj.onNext(nextProps);
        this.forceUpdate();
    }
    
    shouldComponentUpdate() {
        return false;
    }
    
    render() {
        return this.__domTree;
    }
}


const
    adapter = new ReactAdapter(),
    reactCounter = adapter.convertComponent(counter);


setTimeout(() => {
    ReactDOM.render(React.createElement('div', null, reactCounter(null, 'My counter:')), document.getElementById('content'));
}, 0);



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

for (let tagName of tagNames) {
    domBuilder[tagName] = function (props, ...children) {
        return React.createElement(tagName, props, ...children);
    };
}