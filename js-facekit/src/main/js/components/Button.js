'use strict';

import ComponentHelper from '../helpers/ComponentHelper.js';
import EventMappers from '../helpers/EventMappers.js';
import {Component} from 'js-surface';
import {Objects, Strings, Arrays, Seq} from 'js-prelude';


const {createElement: dom} = Component;

export default Component.createFactory({
    typeId: 'FKButton',

    properties: {
        text: {
            type: 'string',
            defaultValue: ''
        },

        icon: {
            type: 'string',
            defaultValue: ''
        },

        type: {
            type: 'string',
            options: ['default', 'link', 'info', 'warning', 'danger', 'success'],
            defaultValue: 'default'
        },

        disabled: {
            type: 'boolean',
            defaultValue: false
        },

        size: {
            type: 'string',
            options: ['normal', 'large', 'small', 'tiny'],
            defaultValue: 'normal'
        },

        iconPosition: {
            type: 'string',
            options: ['top', 'bottom', 'left', 'right'],
            defaultValue: 'left'
        },

        tooltip: {
            type: 'string',
            defaultValue: ''
        },

        className: {
            type: 'string',
            defaultValue: ''
        },

        menu: {
            type: Array,
            defaultValue: []
        },

        onClick: {
            type: 'function',
            defaultValue: null
        }
    },

    render: renderButton
});

function renderButton({props}) {
    const
        key = props.get('key', null),

        onClick = props.get('onClick'),

        icon = Strings.trimToNull(props.get('icon')),

        iconPosition = props.get('iconPosition'),

        iconElement =
            ComponentHelper.createIconElement(
                icon,
                'fk-button-icon fk-icon fk-' + iconPosition),

        type =
            Arrays.selectValue(
                ['default', 'primary', 'success', 'info', 'warning', 'danger', 'link'],
                props.get('type'),
                'default'),

        text = Strings.trimToNull(props.get('text')),

        textElement =
            text === null
            ? null
            : dom('span',
                {className: 'fk-button-text'},
                text),

        tooltip = props.get('tooltip'), // TODO

        disabled = props.get('disabled'),

        menu =
            Seq.from(props.getObject('menu'))
                .toArray(),

        hasMenu = menu.length > 0,

        isDropdown = hasMenu && !onClick,

        isSplitButton = hasMenu && onClick,

        caret =
            hasMenu
            ? dom('span', {className: 'caret'})
            : null,

        sizeClass = props.get('size'),

        className =
            ComponentHelper.buildCssClass(
                'btn btn-' + type,
                sizeClass,
                (text === null ? null : 'fk-has-text'),
                (iconElement === null ? null : 'fk-has-icon'),
                (!isDropdown ? null : 'dropdown-toggle')),

        doOnClick = event => {
            const onClick = props.get('onClick');

            if (onClick) {
                onClick(EventMappers.mapClickEvent(event));
            }
        },

        button =
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
                (isDropdown ? caret : null));

    let ret;

    if (isDropdown) {
        ret =
            dom('div',
                {className: 'fk-button btn-group ' + props.get('className')},
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
                {className: 'fk-button btn-group ' + props.get('className')},
                button,
                dom('button',
                    {className: 'btn dropdown-toggle btn-' + type},
                    ' ',
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
                {className: 'fk-button btn-group ' + props.get('className')},
                button);
    }

    return ret;
}

