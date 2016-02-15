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
        
        this.bind = (eventName) => {
            let subject = subjectsByName.get(eventName);

            if (!subject) {
                subject = new Subject(); 
                subjectsByName.set(eventName, subject);
            }
            
            return event => subject.next(event);
        }
    }
    
    on(eventName) {
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
