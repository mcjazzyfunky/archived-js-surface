/* global jQuery */

import ComponentHelper from '../helpers/ComponentHelper.js';
import PaginationHelper from '../helpers/PaginationHelper.js';

import { defineComponent, createElement as htm, Types } from 'js-surface';
import { Seq, Strings } from 'js-prelude';


const name = 'Button';

const properties = {
    text: {
        type: Types.string,
        defaultValue: ''
    },

    icon: {
        type: Types.string,
        defaultValue: ''
    },

    type: {
        type: Types.oneOf(['default', 'primary', 'link', 'info', 'warning', 'danger', 'success']),
        defaultValue: 'default'
    },

    disabled: {
        type: Types.bool,
        defaultValue: false
    },

    size: {
        type: Types.oneOf(['normal', 'large', 'small']),
        defaultValue: 'normal'
    },

    iconPosition: {
        type: Types.oneOf(['top', 'bottom', 'left', 'right']),
        defaultValue: 'left'
    },

    tooltip: {
        type: Types.string,
        defaultValue: ''
    },

    className: {
        type: Types.string,
        defaultValue: ''
    },

    menu: {
        type: Types.array,
        defaultValue: []
    },

    onClick: {
        type: Types.func,
        defaultValue: null
    }
};


function defineBehavior() {
    let elem = null;
    
    return {
        onDidMount({ data }) {
            if (elem) {
             //   jQuery(elem).dropdown();
            }
        },
        
        render({ props }) {try {
            const
                key = props.key,
        
                onClick = props.onClick,
        
                icon = Strings.trimToNull(props.icon),
        
                iconPosition = props.iconPosition,
        
                iconElement =
                    ComponentHelper.createIconElement(
                        icon,
                        'fk-button-icon fk-icon fk-' + iconPosition),
                
                type = props.type,
                
                text = Strings.trimToNull(props.text),
        
                textElement =
                    text === null
                    ? null
                    : htm('span',
                        {className: 'fk-button-text'},
                        text),
        
                tooltip = props.tooltip, // TODO
        
                disabled = props.disabled,
        
                menu =
                    Seq.from(props.menu)
                        .toArray(),
        
                hasMenu = menu.length > 0,
        
                isDropdown = hasMenu && !onClick,
        
                isSplitButton = hasMenu && onClick,
        
                caret =
                    hasMenu
                    ? htm('span', {className: 'caret'})
                    : null,
        
                sizeClass = { large: 'btn-lg', small: 'btn-sm'}[props.size] || null,
        
                className =
                    ComponentHelper.buildCssClass(
                        'btn btn-' + type,
                        sizeClass,
                        (text === null ? null : 'fk-has-text'),
                        (iconElement === null ? null : 'fk-has-icon'),
                        (!isDropdown ? null : 'dropdown-toggle')),
        
                doOnClick = event => {
                    const onClick = props.onClick;
        
                    if (onClick) {
        //                onClick(EventMappers.mapClickEvent(event));
                    }
                },
        
                button =
                    htm('button',
                        { type: 'button'
                        , className: className
                        , title: tooltip
                        , disabled: disabled
                        , onClick: doOnClick
                        , key: key
                        , 'data-toggle': isDropdown ? 'dropdown' : null
                        },
                        (iconPosition === 'left' || iconPosition === 'top'
                             ? [iconElement, (text !== null && icon !== null ? ' ' : null), textElement]
                             : [textElement, (text !== null && icon !== null ? ' ' : null), iconElement]),
                        (isDropdown ? caret : null));
        
            let ret;
        
            if (isDropdown) {
                ret =
                    htm('div.fk-button.btn-group',
                        { className: props.className
                        },
                        button,
                        htm('ul',
                            {className: 'dropdown-menu'},
                            htm('li/a.dropdown-item',
                                { className: 'dropdown-item', href: '#' },
                                'Juhu'),
                            htm('li/a.dropdown-item',
                                { className: 'dropdown-item', href: '#' },
                                'Juhu2')))
        
            } else if (isSplitButton) {
                ret =
                    htm('div',
                        {className: 'fk-button btn-group dropdown ' + props.className},
                        button,
                        htm('button',
                            { ref: element => elem = element
                            , className: 'btn dropdown-toggle dropdown-toggle-split btn-' + type
                            , 'data-toggle': 'dropdown'
                            , type: 'button'
                            },
                            ' ',
                            caret),
                        htm('div.dropdown-menu',{className: 'dropdown-menu'},
                            htm('li/a.dropdown-item',
                                { className: 'dropdown-item', href: '#' },
                                'Juhu'),
                            htm('li/a.dropdown-item',
                                { className: 'dropdown-item', href: '#' },
                                'Juhu2')));
            } else {
                ret =
                    htm('div',
                        { className: 'fk-button btn-group ' + props.className },
                        button);
            }
        
            return ret;
        } catch (e) {
        console.log(e, 'xxx')
        }
        }
    };
}


export default defineComponent({
    name,
    properties,
    defineBehavior
});