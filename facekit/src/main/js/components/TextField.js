/* global jQuery */

import ComponentHelper from '../helpers/ComponentHelper.js';
import PaginationHelper from '../helpers/PaginationHelper.js';

import { defineComponent, defineIntents, createElement as htm, Types } from 'js-surface';
import { Seq, Strings } from 'js-prelude';

const name = 'TextField';

let nextAutoId = 0;

const properties = {
    className: {
        type: Types.string,
        defaultValue: null
    },
    
    defaultValue: {
        type: Types.string,
        defaultValue: null
    },

    disabled: {
        type:Types.bool,
        defaultValue: false
    },

    id: {
        type: Types.string,
        defaultValue: ''
    },

    label: {
        type: Types.string,
        defaultValue: ''
    },

    readOnly: {
        type: Types.bool,
        defaultValue: false
    },

    value: {
        type: Types.string,
        defaultValue: null
    }
};

const Intents = defineIntents({
    setValue: true,
    callback: true
});

function initState(props) {
    let value = props.value;
    
    if (props.value === null) {
        value = props.defaultValue;
    } 

    if (value === null) {
        value = '';
    }

    return { value };
}

const stateTransitions = {
    setValue(val) {
        return state => ({ value: val }); 
    }
};

function initInteractions(send) {
    return {
        callback(func, event) {
            func(event);
        }
    };
}

function onNextProps({ props, nextProps, state, send }) {
    if (props.value !== null && nextProps.value !== state.value) {
        send(Intents.setValue(nextProps.value));
    }
}

function render({ props, state, prevState, send }) {
    const
        onChange = event => {
            const newValue = event.target.value;
            
            if (props.value !== null) {
                if (props.onChange) {
                    send(Intents.callback(props.onChange, createChangeEvent(newValue)));
                }    
            } else {
                send(Intents.setValue(event.target.value));
            }
        },
        
        id = props.id ? props.id : 'fk--text-field-' + (nextAutoId++),
        label = createLabel(props.label + ' ' + state.value + ', ' + props.value, id),
        value = state.value,
        prevValue = prevState ? prevState.value : null,
        className = ComponentHelper.buildCssClass('form-group fk-text-field', props.className);

    if (prevValue !== null && value !== prevValue && props.onChange) {
        send(Intents.callback(
            props.onChange,
            createChangeEvent(value)));
    }

    return (
        htm('div',
            { className },
            label,
            htm('input',
                { className: 'form-control'
                , type: 'text'
                , id: id
                , value: state.value
                , onChange
                , disabled: props.disabled
                , readOnly: props.readOnly
                }))
    );
}

export default defineComponent({
    name,
    initState,
    stateTransitions,
    initInteractions,
    onNextProps,
    render
})

// -------------------------------------------------------------------

function createLabel(text, id) {
    let ret;
    
    if (typeof text !== 'string' || text.trim().length === 0) {
        ret = null;
    } else {
        ret = htm('label', { htmlFor: id }, text.trim());
    }
    
    return ret;
}

function createChangeEvent(value) {
    return {
        type: 'change',
        value
    };    
}