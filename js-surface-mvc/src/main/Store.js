'use strict';

import Model from './Model.js';

export default class Store {
    constructor(model) {
        if (!(model instanceof Model)) {
            throw new TypeError(
                "[Store.constructor] First argument 'model' must must be "
                + 'a instance of class Model');
        }


        this.__model = model;

        this.__modificationEvents = model.modificationEvents.map(event => ({
            type: 'modification'
        }));
    }

    get modificationEvents() {
        return this.__model.modificationEvents;
    }

    get notificationEvents() {
        return this.__model.notificationEvents;
    }

    createSnapshot() {
        const
            modelClone = Object.create(Object.getPrototypeOf(this.__model)),
            snapshot = Object.create(Object.getPrototypeOf(this));

        snapshot.__model = modelClone;
        modelClone.__state = this.__model.__state;
        modelClone.__oldState = undefined;

        return snapshot;
    }
}