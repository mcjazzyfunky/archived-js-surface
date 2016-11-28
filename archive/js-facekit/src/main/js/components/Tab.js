'use strict';

import {Surface} from 'js-surface';
import {SurfaceX} from 'js-surface-x';

const dom = Surface.createElement; 

export default SurfaceX.createFactory({
    typeId: 'FKTab',

    properties: {
        caption: {
            type: 'string',
            defaultValue: ''
        }  
    },
    
    render:
        props =>
            dom('div',
                {className: 'fk-tab'},
                props.children)
});
