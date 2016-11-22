'use strict';

import Store from './Store.js';
import {Functions, EventSubject, Types} from 'js-prelude';

const modelMeta = new WeakMap();
const GETTER_NAME_REGEX = /^(get|find)[A-Z]|^[a-z]*s[A-Z]/;

export default class Model {
    constructor(params = null) {
        this.__meta = determineModelMeta(Object.getPrototypeOf(this).constructor);
        this.__params = params === undefined ? null : params;

        this.__modificationSubject = new EventSubject();
        this.__notificationSubject = new EventSubject();

        this.__store = new this.__meta.storeClass(this);
        this.__controller = new this.__meta.controllerClass(this);

        this.dispatcher = createDispatcher(this);
        this.disposer = createDisposer(this);

        defineReadWriteProperty(this, '__state', null);
        defineReadWriteProperty(this, '__oldState', undefined);
        defineReadWriteProperty(this, '__modificationTransmissionTimeoutId', null);

        Object.freeze(this.__params);
        Object.freeze(this);
    }

    get params() {
        return this.__paramms;
    }

    get state() {
        return this.__state;
    }

    set state(newState) {
        if (newState === undefined) {
            throw new TypeError(
                "[Model#set-state] First argument 'newState' must not be  undefined");
        }

        this.__state = newState;

        if (this.__modificationTransmissionTimeoutId === null) {
            this.__modificationTransmissionTimeoutId = setTimeout(() => {
                const oldState = this.__oldState;

                this.__oldState = newState;
                this.__modificationTransmissionTimeoutId = null;

                this.__modificationSubject.next({
                    type: 'modification',
                    newState,
                    oldState
                });
            }, 0);
        }

    }

    get modificationEvents() {
        return this.__modificationSubject.asEventStream();
    }

    get notificationEvents() {
        return this.__notificationSubject.asEventStream();
    }

    get store() {
        return this.__store;
    }

    get controller() {
        return this.__controller;
    }

    notify(...args) {
        const notification =
            args.length > 1
            ? args
            : args[0];

        if (Types.isSomething(notification)) {
            setTimeout(() => {
                this.__notificationSubject.next(notification);
            });
        }
    }
}

Object.defineProperty(Model, 'storeClass', {
    get() {
        let meta = modelMeta.get(this);

        if (!meta) {
            meta = determineModelMeta(this);
            modelMeta.set(this, meta);
        }

        return meta.storeClass;
    }
});

function determineModelMeta(modelClass) {
    const
        getterNames = new Set(),
        actionNames = new Set();

    let prototype = modelClass.prototype;

    while (prototype !== Model.prototype) {
        for (let propName of Object.getOwnPropertyNames(prototype)) {
            if (typeof propName === 'string'
                && propName !== 'constructor'
                && propName[0] !== '_'
                && typeof prototype[propName] === 'function'
                && Model[propName] === undefined) {

                if (propName.match(GETTER_NAME_REGEX)) {
                    getterNames.add(propName);
                } else {
                    actionNames.add(propName);
                }
            }
        }

        prototype = Object.getPrototypeOf(prototype);
    }

    const
        storeClass = createStoreClass(modelClass, getterNames),
        controllerClass = createControllerClass(modelClass, storeClass, actionNames);

    return {
        getterNames,
        actionNames,
        storeClass,
        controllerClass
    };
}

function createStoreClass(modelClass, getterNames) {
    const
        storeClass = function (model) {
            Store.call(this, model);
        this.__model = model;
        },

        proto = Object.create(Store.prototype);

    storeClass.prototype = proto;

    for (let getterName of getterNames) {
        proto[getterName] = function (...args) {
           return modelClass.prototype[getterName].apply(this.__model, args);
        };
    }

    return storeClass;
}

function createControllerClass(modelClass, storeClass, actionNames) {
    const
        controllerClass = function (model) {
             storeClass.call(this, model);
             this.__model = model;
        },

        proto = Object.create(storeClass.prototype);

    controllerClass.prototype = proto;

    for (let actionName of actionNames) {
        let method = buildControllerActionMethod(
            modelClass.prototype[actionName]
        );

        proto[actionName] = method;
    }

    return controllerClass;
}

function createDispatcher(model) {
    return (actionName, payload) => {
        if (typeof actionName !== 'string' || actionName === '') {
            throw new TypeError(`[Model#dispatch] First argument 'actionName' must be a non-empty string`);
        }

        const actionNames = model.__meta.actionNames;

        let methodName = null;

        if (actionNames.has(actionName)) {
            methodName = actionName;
        }

        if (!methodName) {
            const alternativeMethodName =
                'on' + actionName[0] + actionName.substr(1);

            if (actionNames.has(alternativeMethodName)) {
                methodName = alternativeMethodName;
            }
        }

        if (!methodName) {
            throw new Error(`Illegal action name '${actionName}'`);
        }

        model.controller[methodName]();

        return;
    };
}

function createDisposer(model) {
    return () => {
        // TODO: implement
    };
}

function buildControllerActionMethod(fn) {
    let ret;

    if (!Functions.isGeneratorFunction(fn)) {
        ret = function (...args) {
            let ret2;

            const
                result = fn.apply(this.__model, args);

            if (result instanceof Promise) {
                ret2 = new Promise(function (resolve, reject) {
                    result.then(value => {
                        setTimeout(() => resolve(value), 0);
                    })
                    .catch(err => reject(err));
                });
            } else {
                ret2 = new Promise((resolve, reject) => {
                    setTimeout(
                        () => resolve(result),
                        0);
                });
            }

            return ret2;
        };
    } else {
        return (...args) => {
            const
                handleNext = (generator, seed, resolve, reject) => {
                    try {
                        const
                            {value, done} = generator.next(seed),
                            valueIsPromise = value instanceof Promise;

                        if (done) {
                            if (valueIsPromise) {
                                value.then(resolve, reject);
                            } else {
                                resolve(value);
                            }
                        } else {
                            if (valueIsPromise) {
                                value.then(result => handleNext(generator, result, resolve, reject), reject);
                            } else {
                                handleNext(generator, value, resolve, reject);
                            }
                        }
                    } catch (err) {
                        generator.return();
                        reject(err);
                    }
                };

            return new Promise((resolve, reject) =>
                handleNext(fn(...args), undefined, resolve, reject));
        };
    }

    return ret;
}

function defineReadWriteProperty(obj, propertyName, initialValue) {
    let value = initialValue;

    Object.defineProperty(obj, propertyName, {
        get() {
            return value;
        },

        set(newValue) {
            value = newValue;
        }
    });
}
