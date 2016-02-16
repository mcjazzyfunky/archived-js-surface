'use strict';

import {Subject} from 'rxjs';

export default class EventBinder {
    constructor() {
        const subjectsByName = new Map();
    
        this.on = (eventName) => {
            let ret = subjectsByName.get(eventName);
            
            if (!ret) {
                ret = new Subject(); 
                subjectsByName.set(eventName, ret);
            }
            
            return ret.asObservable();
        }    
        
        this.bind = (eventName, mapper = null) => {
            if (typeof eventName !== 'string') {
                throw new TypeError('[EventBinder:bind] First argument must be a string');
            } else if (mapper !== undefined && mapper !== null && typeof mapper !== 'function') {
                throw new TypeError('[EventBinder:bind] Second argument must either be a function or empty');
            }
            
            let subject = subjectsByName.get(eventName);

            if (!subject) {
                subject = new Subject(); 
                subjectsByName.set(eventName, subject);
            }
            
            const mappedEvent = mapper ? mapper(event) : event;
            
            return event => subject.next(mappedEvent);
        }
    }
    
    on(eventName, mapper) {
        throw Error('[EventBinder:on] Method not implemented');
    }
    
    bind(eventName) {
        throw Error('[EventBinder:bind] Method not implemented');
    }
   
    /* TODO - implement 
    clear() {
        ...
    }
    */
}
