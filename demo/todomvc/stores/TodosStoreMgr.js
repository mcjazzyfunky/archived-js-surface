'use strict';

import {Objects, Seq, Store, Strings} from 'js-prelude';

let nextTodoId = 0;

const
    filters = {
        all: _ => true,
        completed: todo => todo.completed,
        active: todo => !todo.completed
    },

    adjustFilter = filterKey => {
        return filters.hasOwnProperty(filterKey) ? filterKey : 'all'
    };

const initialState = {
    todos: [],
    filter: 'all'
};

export default Store.createClass({
    initialState() {
        let ret;

        const paramsState = this.params.initialState;

        if (!paramsState
            || typeof paramsState !== 'object'
            || !Array.isArray(paramsState.todos)) {

            ret = initialState;
        } else {
            ret = {
                todos:
                    Seq.from(paramsState.todos)
                        .filter(todo => todo !== null && typeof todo === 'object')
                        .map((todo, index) => ({
                            text: Strings.asString(todo.text),
                            completed: !!todo.completed,
                            id: index
                        })),

                filter: adjustFilter(paramsState.filter)
            };
        }

        nextTodoId = ret.todos;

        return ret;
    },

    getters: {
        getState() {
            return this.state;
        },

        getFilteredTodos() {
            return this.state.todos.filter(filters[this.state.filter]);
        },

        getFilterName() {
            return this.state.filter;
        }
    },

    actions: {
        setFilter(value) {
            return Objects.transform(this.state, {
                filter: {$set: adjustFilter(value)}
            });
        },

        addTodo(text, completed = false) {
            return Objects.transform(this.state, {
                todos: {$push: {
                    id: ++nextTodoId,
                    text: text,
                    completed: completed
                }}
            });
        },

        removeTodo(id) {
            return Objects.transform(this.state, {
                todos: {$update: todos => todos.filter(todo => todo.id === id)}
            })
        },

        clearCompletedTodos() {
            return Objects.transform(this.state, {
                todos: {$update: todods => todos.filter(todo => todo.completed)}
            });
        },

        setTodoCompleted(id, value = true) {
            return Objects.transform(this.state, {
                todos: {$update: todos => todos.map(todo =>
                    todo.id === id
                        ? Objects.transform(todo, {completed: {$set: !value}})
                        : todo
                )}
            });
        },

        setTodoText(id, text) {
            this.state = Objects.transform(this.state, {
                todos: {$update: todos => todos.map(todo =>
                    todo.id === id
                    ? Object.transform(todo, {text: {$set: text}})
                    : todo
                )}
            })
        }
    }
});
