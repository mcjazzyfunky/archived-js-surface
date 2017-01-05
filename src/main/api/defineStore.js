import Store from '../private/store/Store.js';

export default function defineStore(config) {
   const
       defaultInitialState = config.initialState || null,
       initialData = config.initialData || null;

   return function (initialState = defaultInitialState) {
       return new Store(config.messageClass, initialState, initialData);
   };
}
