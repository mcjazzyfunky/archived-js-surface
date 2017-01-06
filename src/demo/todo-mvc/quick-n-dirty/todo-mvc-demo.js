import {
	hyperscript as dom,
	defineFunctionalComponent,
	defineMessages,
	defineStandardComponent,
	defineStore,
	render
} from 'js-surface';

const
	LOCAL_STORAGE_KEY = 'TodoMVC',

	Filter = {
		ALL: 'all',
		ACTIVE: 'active',
		COMPLETED: 'completed'
	},

	Filters = {
		[Filter.ALL]: todo => true,
		[Filter.ACTIVE]: todo => !todo.completed,
		[Filter.COMPLETED]: todo => todo.completed
	},

	getDefaultAppState = () => ({
		todos: [],
		inputText: '',
		activeFilter: Filter.ALL,
		editTodoId: null,
		editTodoText: ''
	}),

	determineNextId = todos =>
		todos.reduce((prev, next) => Math.max(prev.id, next.id), 0) + 1,

	Action = defineMessages({
		updates: {
			SetFilter: filter => state => {
				state.activeFilter = filter;
			},

			SetInputText: text => state => {
				state.inputText = text;
			},

			StartTodoEditing: (id, text) => state => {
				state.todoEditId = id,
				state.todoEditText = text;
			},

			StopTodoEditing: () => state => {
				state.todoEditId = null;
				state.todoEditText = '';
			},

			UpdateTodoText: (id, text) => state => {
				for (let todo of state.todos) {
					if (todo.id === id) {
						todo.text = text;
						break;
					}
				}
			},

			UpdateTodoCompleted: (id, completed) => state => {
				for (let todo of state.todos) {
					if (todo.id === id) {
						todo.complete = completed;
						break;
					}
				}
			},

			UpdateTodoCompleteness: completed => state => {
				state.todos.forEach(todo => {
					todo.completed = completed;
				});
			},

			AddTodo: (text, completed = false) => state => {
				state.todos.push({
					id: determineNextId(state.todos),
					text,
					completed
				});
			},

			RemoveTodoById: id => state => {
				state.todos = state.todos.filter(todo => todo.id !== id);
			},

			RemoveCompletedTodos: () => state => {
				state.todos = state.todos.filter(todo => !todo.completed);
			}
		}
	}),

	Store = defineStore({
		messageType: Action,

		init: initialState => ({
			initialState: initialState
				? initialState
				: getDefaultAppState()
		})
	}),

	initStore = () => {
		const
			initialState =
				window.localStorage.getItem(LOCAL_STORAGE_KEY) || null,

			store = Store.create(initialState);

		store.subscribe(state => {
			window.localStorage.setItem(LOCAL_STORAGE_KEY, state);
		});

		return store;
	},

    store = initStore(),

	App = defineStandardComponent({
		name: 'App',

		properties: {
			store: {
				type: Store
			}
		},

		init() {
			this.__unsubscribeFromStore = null;
		},

		onWillMount() {
			this.__unsubscribeFromStore = store.subscribe(
				() => this.refresh());
		},

		onWillUnmount() {
			this.__unsubscribeFromStore();
			this.__unsubscribeFromStore = null;
		},

		render() {
			const
				store = this.props.store,
				state = store.getState(),
				activeFilter = store.activeFilter,
				dispatch = event => store.dispatch(event);

			return (
				dom('div',
					null,
					AppHeader({
						inputText: state.inputText,
						dispatch
					}),
					AppBody({
						todos: state.todos,
						todoEditId:	state.todoEditId,
						todoEditText: state.todoEditText,
						activeFilter,
						dispatch
					}),
					AppFooter({
						activeFilter,
						dispatch
					}))
			);
		}
	}),

	AppHeader = defineFunctionalComponent({
		name: 'AppHeader',

		properties: {
			inputText: {
				type: String
			},
			dispatch: {
				type: Function
			}
		},

		render() {
			return (
				App
			);
		}
	}),

	AppBody = defineFunctionalComponent({
		name: 'AppBody',

		properties: {
			todos: {
				type: Array,
				defaultValue: []
			},

			todoEditId: {
				type: Number,
				defaultValue: null
			},

			todoEditText: {
				type: String
			},

			activeFilter: {
				type: String
			},

			dispatch: {
				type: Function
			}
		},

		render() {
			return (
				dom('div')
			);
		}
	}),

	AppFooter = defineFunctionalComponent({
		name: 'AppFooter',

		properties: {
			activeFilter: {
				type: String
			},
			dispatch: {
				type: Function
			}
		},

		render() {
			return (
				dom('section')
			);
		}
	});

render(App({ store }), 'main-content');
