import defineExtComponent from '../core/src/main/defineExtComponent.js';
import defineIntents from '../util/src/main/defineIntents.js';
import Types from '../util/src/main/Types.js';
import ReactDOM from 'react-dom';

import {
	defineReactComponent,
    createElement,
    isElement
} from './shared/react/react.js';

function defineComponent(config) {
	return defineExtComponent(config, defineReactComponent);
}

export {
    createElement,
	defineComponent,
	defineIntents,
    isElement,
    mount,
    Types
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
