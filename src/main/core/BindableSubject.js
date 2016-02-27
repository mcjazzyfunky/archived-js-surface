'use strict';

import {Subject} from 'rxjs';

export default class BindableSubject extends Subject {
    bind(mapper = e => e) {
        if (typeof map !== 'function') {
            throw new TypeError("[BindableSubject:bind] First argument 'mapper' must be a function");
        }
        
        return e => this.next(mapper(e));
    }
    
    bindComplete() {
        return () => this.complete();
    }
    
    bindError() {
        return err => this.error(err);
    }
}