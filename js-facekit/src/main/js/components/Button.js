'use strict';

import ComponentHelper from '../helpers/ComponentHelper.js';
import {Component, BindableSubject} from 'js-bling';
import {Objects, Strings, Arrays, Seq} from 'js-prelude';

const dom = Component.createElement;

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

    view: behavior => {
        const onClick = new BindableSubject();

        return {
            display:
                behavior.map(props => renderButton(props, onClick)),
            
            events: {
                click: onClick.toObservable()
            }
        };
    }
});
    
function renderButton(props, onClick) {
    const
        key = props.key,
        
        onClickProp = props.onClick,
        
        doOnClick =
            typeof onClickProp === 'function'
            ? onClick.bind(evt => "todo")
            : null,

        icon = Strings.trimToNull(props.icon),
       
        iconPosition = props.iconPosition,
        
        iconElement =
            ComponentHelper.createIconElement(
                icon,
                'fk-button-icon fk-icon fk-' + iconPosition),
        
        type =
            Arrays.selectValue(
                ['default', 'primary', 'success', 'info', 'warning', 'danger', 'link'],
                props.type,
                'default'),

        text = Strings.trimToNull(props.text),
        
        textElement =
            text === null
            ? null
            : dom('span',
                {className: 'fk-button-text'},
                text),
    
        tooltip = props.tooltip, // TODO
        
        disabled = !!props.disabled,
        
        menu =
            Seq.from(props.menu)
                .toArray(),
        
        hasMenu = menu.length > 0,
        
        isDropdown = hasMenu && !onClick,
        
        isSplitButton = hasMenu && onClick,
        
        caret =
            hasMenu
            ? dom({className: 'caret'})
            : null,

        sizeClass =
            Objects.get(
                {large: 'btn-lg', small: 'btn-sm', 'extra-small': 'btn-xs'},
                props.size, ''),

        className =
            ComponentHelper.buildCssClass(
                'btn btn-' + type,
                sizeClass,
                (text === null ? null : 'fk-has-text'),
                (iconElement === null ? null : 'fk-has-icon'),
                (!isDropdown ? null : 'dropdown-toggle'));

    const button = (
        dom('button', {
                type: 'button',
                className: className,
                title: tooltip,
                disabled: disabled,
                onClick: doOnClick,
                key: key
            },
            (iconPosition === 'left' || iconPosition === 'top'
                    ? [iconElement, (text !== null && icon !== null ? ' ' : null), textElement]
                    : [textElement, (text !== null && icon !== null ? ' ' : null), iconElement]),
            (isDropdown ? caret : null))
    );
    
    let ret;

    if (isDropdown) {
        ret =
            dom('div',
                {className: 'fk-button btn-group ' + props.className},
                button,
                dom('ul',
                    {className: 'dropdown-menu'},
                    dom('li',
                        null,
                        dom('a',
                            null,
                            'Juhu'))));
    } else if (isSplitButton) {
        ret = 
            dom('div',
                {className: 'fk-button btn-group ' + props.className},
                button,
                dom('button',
                    {className: 'btn dropdown-toggle btn-' + type},
                    caret),
                dom('ul',
                    {className: 'dropdown-menu'},
                    dom('li',
                        null,
                        dom('a',
                            null,
                            'Juhu'))));
    } else {
        ret =
            dom('div',
                {className: 'fk-button btn-group ' + props.className},
                button);
    }

    return ret;
}

