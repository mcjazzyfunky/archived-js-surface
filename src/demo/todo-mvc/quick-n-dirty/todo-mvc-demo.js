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
		editingTodoID: null,
		editingText: ''
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

			StartEditing: (id, text) => state => {
				state.editingTodoID = id,
				state.editingText = text;
			},

			ClearEditing: () => state => {
				state.editingTodoID = null;
				state.editingText = '';
			},

			RemoveCompletedTodos: () => state => {
				state.todos = state.todos.filter(Filters[Filter.COMPLETED]);
			},

			UpdateTodos: ({ id, text, completed }) => state => {
				state.todos.forEach(todo => {
					if (id === undefined || id === todo.id) {
						if (text !== undefined) {
							todo.text = text;
						}

						if (completed !== undefined) {
							todo.completed = completed;
						}
					}
				});
			},

			AddTodo: (text, completed = false) => state => {
				state.todos.push({
					id: determineNextId(state.todos),
					text,
					completed
				});
			},

			RemoveTodos: ({ id, text, completed }) => state => {
				state.todos = state.todos.filter(
					todo =>
					    !(id === undefined || todo.id === id
					    && text === undefined || todo.text === text
					    && completed === undefined || todo.completed === completed)
				);
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
			this.__unsubscrieFromStore = null;
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
			const store = this.props.store;

			return (
				dom('div',
					null,
					AppHeader({ store }),
					AppBody({ store }),
					AppFooter({ store }))
			);
		}
	}),

	AppHeader = defineFunctionalComponent({
		name: 'AppHeader',

		properties: {
			store: {
				type: Store
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
			store: {
				type: Store
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
			store: {
				type: Store
			}
		},

		render() {
			return (
				dom('section')
			);
		}
	});

render(App({ store }), 'main-content');
