'use strict';

import React from 'react';
import Immutable from 'immutable';
import {Objects, Strings} from 'mojo';

export default class Component {
    static createFactory(config) {
        const {typeName, view, stateTransitions, initialState, initialStateProvider, defaultProps,
                allowedChildrenTypes, componentDidMount, componentWillUnmount, shouldComponentUpdate} = config;
    
        if (typeName === undefined) {
           throw new TypeError("[Component.createFactory] No 'typeName' provided in configuration object");
        } else if (typeof typeName !== 'string' || typeName !== typeName.trim()) {
            throw new TypeError("[Component.createFactory] Invalid 'typeName' provided in configuration object");
        } else if (view === undefined) {
            throw new TypeError("[Component.createFactory] No 'view' provided in configuration object");
        } else if (view === null || (typeof view !== 'function' && typeof view !== 'object')) {
            throw new TypeError("[Component.createFactory] Invalid 'view' provided in configuration object");
        } else if (typeof view !== 'function') {
            if (view.renderView === undefined) {
                throw new TypeError("[Component.createFactory] No 'renderView' function provided in 'view' object");
            } else if (typeof view.renderView !== 'function') {
                throw new TypeError("[Component.createFactory] Invalid 'renderView' provided in 'view' object");
            } else if (view.initView !== undefined && view.initView !== null && typeof view.initView !== 'function') {
                throw new TypeError("[Component.createFactory] Invalid 'initView' provided in 'view' object");
            } else if (view.disposeView !== undefined && view.disposeView !== null
                    && typeof view.disposeView !== 'function') {
                throw new TypeError("[Component.createFactory] Invalid 'disposeView' function provided in 'view' object");
            }
        } else if (stateTransitions !== undefined && stateTransitions !== null
                && typeof stateTransitions !== 'object') {
            throw new TypeError("[Component.createFactory] Invalid 'stateTransition' provided in configuration object");
        } else if (initialState !== undefined && initialStateProvider !== undefined) {
            throw new TypeError("[Component.createFactory] It's not allowed to provide both 'initialState' and 'initialStateProvider'");
        } else if (initialState !== undefined && initialState !== null && typeof initialState !== 'object') {
            throw new TypeError("[Component.createFactory] Invalid 'initialState' provided int configuration object");
        } else if (initialStateProvider !== undefined && typeof initialStateProvider !== 'function') {
            throw new TypeError("[Component.createFactory] Invalid 'initialStateProvider' function provided");
        } else if (allowedChildrenTypes !== undefined && !Array.isArray(allowedChildrenTypes)) {
            throw new TypeError("[Component.createFactory] Invalid value for 'allowedChildrenTypes'");
        } else if (Objects.isSomething(componentDidMount) && typeof componentDidMount !== 'function') {
           throw new TypeError('[Component.createFactory] '
                + "Configuration parameter 'componentDidMount must be a function");
        } else if (Objects.isSomething(componentWillUnmount) && typeof componentWillUnmount !== 'function') {
           throw new TypeError('[Component.createFactory] '
                + "Configuration parameter 'componentWillUnmount' must be a function");
        } else if (Objects.isSomething(shouldComponentUpdate) && typeof shouldComponentUpdate !== 'function') {
           throw new TypeError('[Component.createFactory] '
                + "Configuration parameter 'shouldComponentUpdate' must be a function");
        }
    
        const normalizedConfig = {
            typeName: typeName,
            defaultProps: defaultProps || null,
            stateTransitions: stateTransitions,
            initialStateProvider: initialStateProvider || (() => initialState || null),
        
            view: typeof view === 'function'
                    ? {
                        initView: () => {},
                        renderView: view,
                        disposeView: () => {}
                        
                    }
                    : {
                        initView: view.initView || (() => {}),
                        renderView: view.renderView,
                        disposeView: view.disposeView || (() => {})
                    }
        };
        
        const constructor = function() {
            BlingComponent.call(this, normalizedConfig);
        };

        constructor.prototype = Object.create(BlingComponent.prototype);
        const ret = React.createFactory(constructor);

        ret.getConfig = () => normalizedConfig;
        return ret;
    }
}


class BlingComponent extends React.Component {
    constructor(config) {
        super();
        this.__config = config;
    }
    
    render() {
        return domBuilder.div(null, "Juhuu");        
    }
}

const
    domBuilder = {},
    tagNames = [
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