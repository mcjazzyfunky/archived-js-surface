'use strict';

import { defineComponent, isElement } from '../../../internal/src/main/react/react.js';

import React from 'react';
import ReactDOM from 'react-dom';

export {
    defineComponent,
    createElement,
    isElement,
    mount
};

function createElement(tags, props, ...children) {
    return React.createElement(tags, props, ...children);
}

function mount(content, targetNode) {
    if (!React.isValidElement(content)) {
        throw new TypeError(
            "[mount] First argument 'content' has to be a valid element");
    }

    if (typeof targetNode === 'string') {
        targetNode = document.getElementById(targetNode);
    }

    ReactDOM.render(content, targetNode);
}
