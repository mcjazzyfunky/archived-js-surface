'use strict';

import ComponentHelper from '../helpers/ComponentHelper.js';
import {Surface} from 'js-surface';
import {SurfaceX} from 'js-surface-x';

const dom = Surface.createElement; 

export default SurfaceX.createFactory({
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

    render: renderButtonGroup
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
