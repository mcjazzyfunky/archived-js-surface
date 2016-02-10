'use strict';

import Component from './Component.js';

export default Component.createFactory({
    typeName: 'facekit/Label',
    
    view: (dom, props, state, ctrl) => {
        return dom.label(null, props.get('text'));
    },
    
    defaultProps: {
        text: ''
    }
});
