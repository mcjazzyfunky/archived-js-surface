import Store from '../internal/store/Store.js';

export default function defineStore(config) {
   const
       defaultInitialState = config.initialState || null,
       initialData = config.initialData || null;

   return (initialState = defaultInitialState) =>
       new Store(config.messageClass, initialState, initialData);
}
