import { defineComponent, defineIntents, createElement as htm, Types, isElement } from 'js-surface';

import { Seq } from 'js-prelude';

import TextField from '../../main/js/components/TextField.js';

const name = 'FKInputsDemo';

const Intends = defineIntents({
    setFirstName: true
});

function initState(props) {
    return { firstName: 'John Doe' };
}

const stateTransitions = {
    setFirstName(value) {
        return state => Object.assign({}, state, { firstName: value });
    }
}

function render({ props, state,  send }) {
    return (
        htm('div',
            null,
            state.firstName,
            TextField({
                label: 'First name:',
                value: state.firstName,
                onChange: ev => send(Intends.setFirstName(ev.value))
            })));
}


export default defineComponent({
    name,
    initState,
    stateTransitions,
    render
})