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
    
    view: behavior => behavior.map(renderTab)
});

function renderTab(props) {
    return (
        dom('div',
            {className: 'fk-tab'},
            props.children)
    );
}
