'use strict';

export default class Emitter {
    constructor(onNext = null, onError = null, onComplete = null) {
        if (onNext !== null && typeof onNext !== 'function') {
            throw new TypeError(
                '[Emitter.constructor] '
                + "First argument 'onNext' must be a function or null");
        } else if (onError !== null && typeof onError !== 'function') {
            throw new TypeError(
                '[Emitter.constructor] '
                + "First argument 'onNext' must be a function or null");
        } else if (onComplete !== null && typeof onComplete !== 'function') {
            throw new TypeError(
                '[Emitter.contructor] '
                + "Second argument 'onComplete' must be a function or null");
        }

        this.__onNext = onNext;
        this.__onError = onError;
        this.__onComplete = onComplete;
        this.__finished = false;
    }

    next(value) {
        if (this.__finished) {
            throw new Error(
                '[Emitter#next] '
                + "Tried to call method 'next' on a disposed emitter");
        }

        if (this.__onNext) {
            this.__onNext(value);
        }
    }

    error(err) {
        if (this.__finished) {
            throw new Error(
                '[Emitter#error] '
                + "Tried to call method 'error' on a disposed emitter");
        }

        this.__finished = true;

        if (this.__onError) {
            this.__onError(err);
        }
    }

    complete() {
        if (this.__finished) {
            throw new Error(
                '[Emitter#complete] '
                + "Tried to call method 'complete' on a disposed emitter");
        }

        this.__finished = true;

        if (this.__onComplete) {
            this.__complete();
        }
    }
}

