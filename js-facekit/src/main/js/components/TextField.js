'use strict';

import ComponentHelper from '../helpers/ComponentHelper';
import {Component} from 'js-bling';
import {Subject} from 'rxjs';

const {createElement: dom, createEventBinder: binder} = Component;

export default Component.createFactory({
    typeId: 'FKTextField',

    properties: {
        className: {
            type: 'String',
            defaultValue: null
        },

        disabled: {
            type: 'boolean',
            defaultValue: false
        },

        maxLength: {
            type: 'number',
            defaultValue: null
        },

        onChange: {
            type: 'function',
            defaultValue: null
        },

        onInput: {
            type: 'function',
            defaultValue: null
        },

        placeholder: {
            type: 'string',
            defaultValue: null
        },

        value: {
            type: 'String',
            defaultValue: ''
        },

        visible: {
            type: 'boolean',
            defaultValue: true
        }
    },

    render: props => {
        const
            value = props.get('value'),
            placeholder = props.get('placeholder'),
            maxLength = props.get('maxLength'),
            disabled = props.get('disabled') ? 'disabled' : null,
            visible = props.get('visible'),
            readOnly = props.get('readOnly') ? 'readonly' : null,
            className = ComponentHelper.buildCssClass('fk-text-field', props.get('className')),

            changeEvents = !visible ? null : new Subject(),
            onChange = binder(changeEvents,
            inputEvents = !visible ? null : new Subject(),


            content =
                !visible
                ? dom('span')
                dom('input', {
                    type: 'text',
                    value: text,
                    placeholder: placeholder,
                    className: className,
                    disabled: disabled,
                    readOnly: readOnly,
                    maxLength: maxLength
                });
        );
    }
});

