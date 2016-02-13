'use strict';

alert(1)
const
    {Observable, Subject} = window.Rx,
    React = window.React,
    ReactDOM = window.ReactDOM;


class Component {
    constructor(config) {
        throw new Error('[Component.constructor] Component cannot be instantiated by using the constructor - '
                + "please use the factory method 'Component.create' instead");
    }
    
    getConfig() {
        return this.__config;
    }
    
    static create(config) {
        const typeNameRegex = /[a-zA-Z][a-zA-Z0-9.]*/; 
        
        if (config === null || typeof config !== 'object') {
            throw new TypeError('[Component.create] Component configuration has to of type {typeName : String, view: Function}');
        } else if (config.typeName === undefined  || config.typeName === null) {
            throw new TypeError("[Component.create] Component configuration value 'typeName' is missing");
        } else if (typeof config.typeName !== 'string' || !config.typeName.match(typeNameRegex)) {
            throw new TypeError(`[Component.create] Illegal configuration value 'typeName' (must match regex ${typeNameRegex})`);
        } else if (config.view === undefined || config.view === null) {
            throw new TypeError("[Component.create] Component configuration value 'view' is missing");
        } else if (typeof config.view === 'function') {
            throw new TypeError("[Component.create] Component configuration value 'view' has to be a function");
        }

        const ret = function () {
            this.__config = Object.freeze({
                typeName: config.typeName || null,
                view: config.view
            });
        };
        
        ret.prototype = Object.create(Component.prototype);
        return ret;
    }
}


// [-] 42 [+]
export default Component.create({
    typeId: 'counter',
    
    defaultProps: {
        caption: ''  
    },
    
    view: (dom, {on, bind}, propsObs) => {
        const
            plusObs = on('plusButtonClicked')
                    .map(_ => 1),

            minusObs = on('minusButtonClicked')
                    .map(_ => -1),

            counterObs = Observable.merge(plusObs, minusObs)
                    .startWith(0)
                    .scan((prev, curr) => prev + curr);

        return {
            display: propsObs.merge(counterObs, (props, counter) =>
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
                             counter
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



class Counter extends Component {
    constructor() {
        super({
            typeName: 'Counter',
            
            view: (dom, interaction, propsObs, dependenciesObs) => {
                const
                    {on, bind}  = interaction,
        
                    plusObs = on('plusButtonClicked')
                            .map(_ => 1),
        
                    minusObs = on('minusButtonClicked')
                            .map(_ => -1),
        
                    stateObs = Observable.merge(plusObs, minusObs)
                            .startWith(0)
                            .scan((prev, curr) => prev + curr), 
        
                    uiTreeObs = propsObs.merge(propsObs, (props, state) =>
                            dom.div(
                                null,
                                dom.button({ onClick: bind('minusButtonClicked') }, '+'),
                                dom.label(null, state),
                                dom.button({ onClick: bind('minusButtonClicked') }, '-'))),
            
                    uiEvents = {
                        update: stateObs.map(state => {counter: state})
                    };
                    
                return {
                    uiTree: uiTreeObs,
                    uiEvents
                };
            }
        });
    } 
}







class ComponentAdapter {
    convertComponent(component) {
         throw Error('[ComponentAdapter:convertComponent] Method has not been implemented/overridden');
    }
}

class ReactAdapter extends ComponentAdapter {
    convertComponent(component) {
        const constructor = function () {};
        constructor.prototype = new ReactComponent(component);
        return React.createFactory(constructor);
    }
}

const domBuilder = {};

class ReactComponent extends React.Component {
    constructor(component) {
        const interaction = {
           on: () => new Observable(),
           bind: () => new Subject()
        };
        
        this.__component = component;
        this.__propsSbj = new Subject();
        this.__subscriptionViewDisplay = null;
        this.__subscriptionViewEvents = null;
        
        const view = this._component.getView(
            domBuilder,
            interaction,
            this.__propsSbj);
        
        this.__viewDisplayObs = view;
        this.__viewEvents = view.events;

    }
    
    componentWillMount() {
        this.__viewDisplayObs.subscribe(domTree => {
            this.__domTree = domTree;
            this.forceUpate();
            this.__domTree = null;
        });
    }
    
    componentWillUnmount() {
        this.__subscription.unsubscribe();
    }
    
    componentWillReceiveProps(nextProps) {
        this.props = nextProps();
        this.__propsSbj.next(nextProps);
        this.forceUpdate();
    }
    
    componentShouldUpdate() {
        return false;
    }
    
    render() {
        return this._domTree;
    }
}


const
    component = new Counter(),
    adapter = new ReactAdapter(),
    ReactCounter = adapter.convertComponent(component);



ReactDOM.render(React.createElement('div', null, ReactCounter()), document.getElementById('content'))


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