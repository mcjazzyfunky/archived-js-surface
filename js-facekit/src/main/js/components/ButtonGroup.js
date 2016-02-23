'use strict';

import ComponentHelper from '../helpers/ComponentHelper.js';
import {Component} from 'js-bling';

const dom = Component.createElement;

export default Component.createFactory({
    typeId: 'FKButtonGroup',
    
    defaultProps: {
        disabled: false,
    },

    view: behavior => behavior.map(props => {
        const
            children = props.children || [], // TODO !!!
            hasChildren = children instanceof Array && children.length > 0,
            className = ComponentHelper.buildCssClass(
                    'fk-button-group',
                    (hasChildren ? 'btn-group' : ''),
                    props.className);

        return (
            dom('div',
                {className: className, role: 'group'},
                children)
        );
    })
});
