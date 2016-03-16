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

    initialState: {
        hasFocus: false
    },

    updateState: action => {
        return {
            hasFocus: action.hasFocus
        };
    },

    render: (props, state) => {
        const
            value = props.get('value'),
            placeholder = props.get('placeholder'),
            maxLength = props.getInteger('maxLength', null),
            disabled = props.get('disabled') ? 'disabled' : null,
            visible = props.get('visible'),
            readOnly = props.get('readOnly') ? 'readonly' : null,
            label = props.getTrimmedStringOrNull('label'),
            labelElem = label === null ? null : dom('label', {className: 'fk-label'}, label),

            className =
                ComponentHelper.buildCssClass(
                    'fk-text-field',
                    props.get('className'),
                    state.hasFocus ? 'fk-has-focus' : null),

            changeEvents = !visible ? null : new Subject(),
            onChange = binder(changeEvents, event => EventMappers.mapChangeEvent(event)),

            inputEvents = !visible ? null : new Subject(),
            onInput = binder(inputEvents, event => EventMappers.mapInputEvent(event)),

            actions = new Subject(),
            onFocus = binder(actions, event => ({hasFocus: true})),
            onBlur = binder(actions, event => ({hasFocus: false})),

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
