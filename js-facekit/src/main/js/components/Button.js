'use strict';

import ComponentHelper from '../helpers/ComponentHelper.js';
import {Component, EventBinder} from 'js-bling';
import {Objects, Strings, Arrays, Seq, Reader} from 'js-prelude';

function buttonDisplay(props, bind) {
    const
        key = props.get('key'),
        
        onClickProp = props.get('onClick'),
        
        onClick = typeof onClickProp === 'function'
                        ? bind('click')
                        : null,
        
        icon = Strings.trimToNull(props.get('icon')),
        
        iconPosition = props.get('iconPosition'),
        
        iconElement = ComponentHelper.createIconElement(
                            icon,
                            'fk-button-icon fk-icon fk-' + iconPosition),
        
        type = Arrays.selectValue([
                        'default', 'primary', 'success', 'info',
                        'warning', 'danger', 'link'],
                    props.get('type'),
                    'default'),
        
        text = Strings.trimToNull(props.get('text')),
        
        textElement = text === null
                            ? null
                            : ['span',
                                    {className: 'fk-button-text'},
                                    text],
        
        tooltip = props.get('tooltip'), // TODO
        
        disabled = !!props.get('disabled'),
        
        menu = Seq.from(props.get('menu'))
                    .filter(item => item instanceof Reader)
                    .toArray(),
        
        hasMenu = menu.length > 0,
        
        isDropdown = hasMenu && !onClick,
        
        isSplitButton = hasMenu && onClick,
        
        caret = hasMenu
                    ? ['span', {className: 'caret'}]
                    : null,

        sizeClass = Objects.get(
                        {large: 'btn-lg', small: 'btn-sm', 'extra-small': 'btn-xs'},
                        props.get('size'), ''),

        className = ComponentHelper.buildCssClass(
                        'btn btn-' + type,
                        sizeClass,
                        (text === null ? null : 'fk-has-text'),
                        (iconElement === null ? null : 'fk-has-icon'),
                        (!isDropdown ? null : 'dropdown-toggle'));

    const button = (
        ['button', {
                type: 'button',
                className: className,
                title: tooltip,
                disabled: disabled,
                onClick: onClick,
                key: key
            },
            ...(iconPosition === 'left' || iconPosition === 'top'
                    ? [iconElement, (text !== null && icon !== null ? ' ' : null), textElement]
                    : [textElement, (text !== null && icon !== null ? ' ' : null), iconElement]),
            (isDropdown ? caret : null)]
    );
    
    var ret;

    if (isDropdown) {
        ret =
            ['div', {className: 'fk-button btn-group ' + props.get('className')},
                button,
                ['ul',
                    {className: 'dropdown-menu'},
                    ['li',
                        null,
                        ['a',
                            null,
                            'Juhu']]]];
                        
    } else if (isSplitButton) {
        ret = (
            ['div', {className: 'fk-button btn-group ' + props.get('className')},
                button,
                ['button',
                    {className: 'btn dropdown-toggle btn-' + type },
                    caret],
                ['ul',
                    {className: 'dropdown-menu'},
                    ['li',  null,
                        ['a', null,
                            'Juhu']]]]
        );
    } else {
        ret = (
            ['div', {className: 'fk-button btn-group ' + props.get('className')},
                button]
        );
    }

    return ret;
}

export default Component.createFactory({
    typeId: 'FKButton',
    
    defaultProps: {
        text: '',
        icon: '',
        type: 'default',
        disabled: false,
        size: 'default',
        iconPosition: 'left',
        menu: [],
        key: null
    },

    view: ({changes, events: {on, bind}}) => {alert(on)
        const
            clicks = on('click').map(() => alert(1))
                    .map(event => {todo: true});

        return {
            display: changes.map(props => buttonDisplay(props, bind)),
            
            notifications: {
                click: clicks
            }
        };
    }
});
