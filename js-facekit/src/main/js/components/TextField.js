'use strict';

import ComponentHelper from '../helpers/ComponentHelper.js';
import EventMappers from '../helpers/EventMappers.js';
import {Component} from 'js-surface';
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

        label: {
            type: 'string',
            defaultValue: null
        },

        maxLength: {
            type: 'number',
            defaultValue: null
        },

        placeholder: {
            type: 'string',
            defaultValue: null
        },

        readOnly: {
            type: 'boolean',
            defaultValue: false
        },

        value: {
            type: 'String',
            defaultValue: ''
        },

        visible: {
            type: 'boolean',
            defaultValue: true
        },

        onChange: {
            type: 'function',
            defaultValue: null
        },

        onInput: {
            type: 'function',
            defaultValue: null
        }
    },

    initialState: props => {
        console.log(444444, props);

        return {
            value: props.get('value')
        };
    },

    updateState: (action, state) => {
        return state;
    },

    render: (props, state) => {
        const
            value = props.get('value'),
            placeholder = props.get('placeholder'),
            maxLength = props.getInteger('maxLength', null),
            disabled = props.get('disabled') ? 'disabled' : null,
            visible = props.get('visible'),
            readOnly = props.get('readOnly') ? 'readonly' : null,
            label = props.get('label'),
            labelElem = label === null ? null : dom('label', {className: 'fk-label'}, label),

            className =
                ComponentHelper.buildCssClass(
                    'fk-text-field',
                    props.get('className')),

            actions = new Subject(),

            changeEvents = !visible ? null : new Subject(),
            onChange = binder(changeEvents, event => EventMappers.mapChangeEvent(event))(),

            inputEvents = !visible ? null : new Subject(),
            onInput = binder(inputEvents, event => EventMappers.mapInputEvent(event))(),

            content =
                !visible
                ? dom('span')
                : dom('div', {
                        className
                    },
                    labelElem,
                    dom('input', {
                        type: 'text',
                        value,
                        placeholder,
                        maxLength,
                        disabled,
                        readOnly,
                        onInput,
                        onChange
                    }));

        return {
            content,
            actions,
            events: {
                input: inputEvents,
                change: changeEvents
            }
        }
    }
});

