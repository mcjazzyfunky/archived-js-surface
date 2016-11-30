import { createElement, defineComponent, isElement } from '../../../react-shared/src/main/react-shared.js';

import ReactDOM from 'react-dom';

export {
    defineComponent,
    createElement,
    isElement,
    mount
};

function mount(content, targetNode) {
    if (!isElement(content)) {
        throw new TypeError(
            "[mount] First argument 'content' has to be a valid element");
    }

    if (typeof targetNode === 'string') {
        targetNode = document.getElementById(targetNode);
    }

    return ReactDOM.render(content, targetNode);
}
