'use strict';

const
    Rx = window.Rx,
    React = window.React,
    ReactDOM = window.ReactDOM;


class Component {
    getTypeName() {
        return null;
    }
    
    getView(domBuilder, eventManager, propsPublisher) {
        throw Error('[Component:getView] Method has not been implemented/overridden');
    }
}

class Counter extends Component {
    getTypeName() {
        return 'Counter';    
    } 
  
    getUI(dom, eventMgr, propsP) {
        const
            on = eventMgr.on,
            bind = eventMgr.bind,
            plusP = on('plusButtonClicked')
                 .map(_ => 1),

            minusP = on('minusButtonClicked')
                .map(_ => -1),

            counterP = Rx.Observable.merge(plusP, minusP)
                .startWith(0)
                .scan((prev, curr) => prev + curr), 

            uiTreeP = counterP.merge(propsP, (counter, props) =>
                    dom.div(
                        null,
                        dom.button({ onClick: bind('minusButtonClicked') }, '+'),
                        dom.label(null, counter),
                        dom.button({ onClick: bind('minusButtonClicked') }, '-'))),
    
            uiEvents = {
                update: counterP.map(counter => {counter})
            };
            
        return {
            uiTree: uiTreeP,
            uiEvents
        };
   };
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
        this._component = component;
        this.__props$ = new Rx.Subject();
        this.__subscription = null;
    }
    
    componentWillMount(nextProps) {
        this.__subscription = this.__props$.subscribe(props => this.setState(null));
    }
    
    componentWillReceiveProps(nextProps) {
        this.__props$.next(nextProps);
    }
    
    render() {
        const ui = this._component.getUI(domBuilder, {on: () => new Rx.Observable(), bind: () => new Rx.Subscriber()}, Rx.Observable.of({}));
        console.log(ui);
        return ui.uiTree.first();
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