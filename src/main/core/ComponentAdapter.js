'use strict';

export default class ComponentAdapter {
    createElement(tag, props, children) {
        throw Error('[ComponentAdapter#createElement] Method not implemented/overridden');
    }

    isElement(what) {
        throw Error('[ComponentAdapter#isElement] Method not implemented/overridden');
    }

    createAdaptedFactory(componentSpec) {
        throw Error('[ComponentAdapter#isElement] Method not implemented/overridden');
    }

    mount(content, targetNode) {
        throw Error('[ComponentAdapter#mount] Method not implemented/overridden');
    }
}