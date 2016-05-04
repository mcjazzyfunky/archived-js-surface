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
        
        defaultValue: {
            type: 'string',
            defaultValue: null
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
            defaultValue: null
        },

        visible: {
            type: 'boolean',
            defaultValue: true
        },

        onChange: {
            type: 'function',
            defaultValue: null
        }
    },
    
    initialState: {   
        value: ''
    },      
    
    stateTransitions: { 
        setValue(value) {
            return state => Objects.transform(state, {
                value: {$set: value}
            }); 
        }
    },
    
    render: ({props, state, ctrl}) => {
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
                    
            doOnChange = event => {
                const value = event.target.value;
                
                ctrl.setValue(value);
                
                props.getMappedFunction(
                    'onChange',
                        event => ({
                        type: 'change',
                        value: event.target.value
                    }),
                    null)(event);
            },
            
            ret =
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

console.log('value', value)
       return ret;
    },
    
    onWillMount({props, ctrl}) {
        if (props.isSomething('defaultValue')) {
            ctrl.setValue(props.getString('defaultValue'));
            console.log("onWillMount - state:", ctrl.getState())
        }    
    },
    
    onNextProps({props, state, ctrl}) {
        if (props.isSomething('value')) {
            const newValue = props.getString('value');
            console.log('dooo', props.__data)
            if (newValue !== state.value) {
                ctrl.setValue(newValue);
            }
        }
    }
});
