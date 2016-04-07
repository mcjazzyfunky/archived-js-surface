'use strict';

import ComponentHelper from '../helpers/ComponentHelper.js';
import {Component} from 'js-surface';
import {commonView} from 'js-surface-views';

const dom = Component.createElement;

export default Component.createFactory({
    typeName: 'FKButtonGroup',
    
    properties: {
        className: {
            type: 'string',
            defaultValue: ''
        },

        disabled: {
            type: 'boolean',
            defaultValue: false
        }
    },

    view:
        commonView(renderButtonGroup)
});

function renderButtonGroup({props}) {
    const
        children =
            props.getArray('children', []),
        
        hasChildren =
            children instanceof Array && children.length > 0,
        
        className =
            ComponentHelper.buildCssClass(
                'fk-button-group',
                (hasChildren ? 'btn-group' : ''),
                props.get('className'));
    
    return (
        dom('div',
            {className: className, role: 'group'},
            children)
    );
}
