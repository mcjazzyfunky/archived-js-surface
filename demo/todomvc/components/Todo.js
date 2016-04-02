'use strict';

import {Store, Strings} from 'js-prelude';
import Storage from './stores/TodoStore.js';
import {Component} from 'js-surface';

const {createElement: dom} = Component;

class ComponentStorage extends Storage {
    get initialValue() {
        return {
            editing: false
        };
    }

    isEditing() {
        return this.state.editing;
    }

    setEditing(value) {
        return Objects.transform(this.state, {
            editing: {$set: !!value}
        });
    }
}


export default Component.createFactory({
    typeId: 'Todo',

    properties: {
        todo: {
            type: 'object'
        },
    },

    context: {
        todosStore: {
            type: TodosStore
        }
    },

    view: Component.createStorageBasedView({
        getStorage() {
            return new ComponentStorage();
        },

        render({ctrl}) {
            const
                todoConfig = props.getConfig('todo'),
                text = todoConfig.getString('text'),
                completed = todoConfig.getBoolean('completed'),
                id = todoConfig.getNumber('id');

            return (
                dom('li',
                    {key: props.g})
            );
        }
    })
})
