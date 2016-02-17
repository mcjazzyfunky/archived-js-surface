'use strict';

import ComponentHelper from '../helpers/ComponentHelper.js';
import {Component} from 'js-bling';

export default Component.createFactory({
    typeId: 'FKButtonGroup',
    
    defaultProps: {
        disabled: false,
    },

    view: ({changes, events: {on, bind}})  => changes.map(props => {
        const
            children = props.__data.children || [], // TODO !!!
            hasChildren = children instanceof Array && children.length > 0,
            className = ComponentHelper.buildCssClass(
                    'fk-button-group',
                    (hasChildren ? 'btn-group' : ''),
                    props.get('className'));

        return (
            ['div', {className: className, role: 'group'},
                ...children]
        );
    })
});
