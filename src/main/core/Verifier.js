'use strict';

export default class Verifier {
    constructor(topic = null) {
        this.__topic = typeof topic !== 'string' ? null : topic.trim();
        this.__type = null;
        this.__key = null,
        this.__rule = null,
        this.__predicate = null;
        this.__nextVerifier = null;
    }
    
    verifyParam(key, rule, predicate) {
        const ret = new Verifier(this.__topic);
        ret.__type = 'verifyParam',
        ret.__key = key;
        ret.__rule = rule;
        ret.__predicate = predicate;
        ret.__nextVerifier = this;
        return ret;
    }
    
    verify(rule, predicate) {
        const ret = new Verifier(this.__topic);
        
        ret.__type = 'verify';
        ret.__rule = rule;
        ret.__predicate = predicate;
        ret.__nextVerifier = this;

        return ret;
    }
    
    evaluate(params) {
        let ret = null,
            verifier = this;
        
        while (verifier) {
            const
                type = verifier.type;
            
            if (type === 'verify') {
                if (!verifier.__predicate(params)) {
                    const prefix = verifier.__topic ? `[${verifier.__topic}] ` : '';
                    
                    ret = new Error(`${prefix} Rule '${verifier.__rule}' not satisfied`);
                    
                    break;
                }
            } else if (type === 'verifyParam') {
                const value = params ? params[this.__key] : undefined;
                
                if (!verifier.__predicate(value)) {
                    const prefix = verifier.__topic ? `[${verifier.__topic}] ` : '';
                    
                    ret = new Error(prefix + `Parameter ${verifier.__rule} ${verifier.__rule}`);
                    break;
                }
            }     
            
            verifier = verifier.__nextVerifier;
        }
        
        return ret; 
    }

    assertOrFail(params) {
        const result = this.evaluate(params);
        
        if (result) {
            throw result;
        }
    }
}
