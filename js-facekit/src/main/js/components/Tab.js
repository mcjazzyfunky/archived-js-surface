'use strict';

import {Component} from 'js-bling';

const dom = Component.createElement;

export default Component.createFactory({
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
