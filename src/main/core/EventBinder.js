'use strict';

import {Subject} from 'rxjs';
import {Verifier} from 'js-bling';

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
            new Verifier('EventBinder.bind')
                    .verifyParam('eventName', 'must be a string',
                            $ => typeof $ === 'string')
                    .verifyParam('mapper', 'must either be a number or nothing',
                            $ => $ === undefined || $ == null || typeof $ === 'function')
                    .assertOrFail({eventName, mapper});
                    
            let subject = subjectsByName.get(eventName);

            if (!subject) {
                subject = new Subject(); 
                subjectsByName.set(eventName, subject);
            }
            
            const mapEvent = mapper
                    ? event => mapper(event)
                    : event => event;
            
            return event => subject.next(mapEvent(event));
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
