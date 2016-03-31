'use strict';

import {Store, Strings} from 'js-prelude';
import TodosStore from './stores/TodoStore.js';
import {Component} from 'js-surface';

const {createElement: dom} = Component;

export const storeFacetsFactory = Store.createFacetsFactory({
    initialValue: {
        editing: false
    },

    getters: {
        isEditing() {
            return this.state.editing;
        }
    },

    actions: {
        setEditing(value) {
            return Objects.transform(this.state, {
                editing: {$set: !!value}
            });
        }
    }
});


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

    view: Component.createStoreBasedView({
        getStoreFacets() {
            return storeSuiteFactory();
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
