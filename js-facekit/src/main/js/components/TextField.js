'use strict';

import ComponentHelper from '../helpers/ComponentHelper.js';
import EventMappers from '../helpers/EventMappers.js';
import {Objects} from 'js-prelude';
import {Component} from 'js-surface';
import {ExtComponent} from 'js-surface-ext';

const {createElement: dom} = Component;

export default ExtComponent.createFactory({
    typeName: 'FKTextField',

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
    
    initialState: {   
        value: ''
    },      
    
    stateTransitions: { 
        setValue(value) {
            return state => {
                console.log('oldState:', state, value, Objects.transform({value: 'x'}, {value: {$set: 'x'}}))
                
                const ret = Objects.transform(state, {
                    value: {$set: value}
                });
            
                console.log('newState:', ret);
                return ret;
            }; 
        }
    },
    
    render: ({props, state, ctrl}) => {console.log('state1', state)
        const
            value = state.value,
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
                    
            doOnChange = props.getMappedFunction('onChange',
                event => ({
                    type: 'change',
                    value: event.target.value
                }),
                null),

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
                        onChange: doOnChange
                    }));

       return content;
    },
    
    onWillMount({props, ctrl}) {console.log(props.__data);
        if (props.isSomething('defaultValue')) {
            ctrl.setValue(props.getString('defaultValue'));
        }    
    },
    
    onWillUpdate({props, ctrl}) {console.log('ctrl', ctrl)
        if (props.isSomething('value')) {
            ctrl.setValue(props.getString('value'));
        }
    }
});
