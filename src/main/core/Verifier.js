'use strict';

export default class Verifier {
    constructor(topic = null) {
        this.__topic = typeof topic !== 'string' ? null : topic.trim();
        this.__key = null,
        this.__rule = null,
        this.__predicate = null;
        this.__nextVerifier = null;
    }
    
    verify(key, rule, predicate) {
        const ret = new Verifier(this.__topic);
        ret.__key = key;
        ret.__rule = rule;
        ret.__predicate = predicate;
        ret.__nextVerifier = this;
        return ret;
    }
    
    evaluate(params) {
        const
            ret = null,
            verifier = this;
        
        while (verifier) {
            const
                value = params ? params.value : undefined;
                
            if (!verifier.__predicate(value)) {
                const prefix = verifier.__topic ? `[${verifier.__topic}] ` : '';
                
                ret = new Error(prefix + `Parameter ${verifier.__rule} ${verifier.__rule}`);
                break;
            }
            
            verifier = verifier.__nextVerifier;
        }
        
        return ret; 
    }
}

    failOnError() {
        const result = this.evaluate();
        
        if (result) {
            throw result;
        }
    }
}