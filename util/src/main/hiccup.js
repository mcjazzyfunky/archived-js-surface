import { createElement } from '../../../core/src/main/core.js';

const
    tagPattern = '[a-zA-Z][a-zA-Z0-9_-]*',
    idPattern = '(#[a-zA-Z][a-zA-Z0-9_-]*)?',
    classPattern = '(\.[a-zA-Z][a-zA-Z0-9_-]*)*',
    partPattern = `${tagPattern}${idPattern}${classPattern}`,
    fullPattern = `^${partPattern}(\/${partPattern})*$`,

    hiccupRegex = new RegExp(fullPattern),
    tagCache = {},
    tagIsSimpleSymbol = Symbol('tagIsSimple');

export default hiccup;

function hiccup(/* tag, ...rest */) {
    let ret = null;
    
    const
        tag = arguments[0],
        type = typeof tag,
        tagIsString = type === 'string';
    
    if (!tagIsString && type !== 'function') {
        throw new Error('[createElement] First parameter tag must either be a string or a component factory function');
    }
    
    if (!tagIsString) {
        ret = createElement.apply(null, arguments);
    } else {
        let result = tagCache[tag];
        
        if (result === tagIsSimpleSymbol) {
            ret = createElement.apply(null, arguments);
        } else if (!result || !tagCache.hasOwnProperty(tag)) {
            const tagIsSimple =
                tag.indexOf('.') === -1
                && tag.indexOf('#') === -1
                && tag.indexOf('/') === -1;
                
            if (tagIsSimple) {
                tagCache[tag] = tagIsSimpleSymbol;
                
                ret = createElement.apply(null, arguments);
            } else if (!tag.match(hiccupRegex)) {
                throw new Error('[createElement] First argument tag is not a proper hiccup string');
            } else {
            
                const parts = tag.split('/');
                
                result = [];
                
                for (let i = 0; i < parts.length; ++i) {
                    const
                        part = parts[i],
                        tagName = part.split(/(#|\.)/, 1)[0],
                        idName = (part.split('#', 2)[1] || '').split('.', 1)[0] || null,
                        className = (part.split('.')).slice(1).join(' ') || null;
        
                    result.push([tagName, idName, className]);
                }           
                
                tagCache[tag] = result;
            }
        }
        
        if (!ret) {
            const
                lastTriple = result[result.length - 1],
                lastTag = lastTriple[0],
                lastId = lastTriple[1],
                lastAttrs = lastId ? { id: lastId } : {},
                secondArg = arguments[2],
                secondArgHasAttrs = secondArg && secondArg.constructor === Object,
                newArgs = [lastTag];
            
            if (secondArgHasAttrs) {
                const
                    lastClassName = lastAttrs.className,
                    lastClassNameIsString = typeof lastClassName === 'string';
                
                Object.assign(lastAttrs, secondArg);
                
                if (lastClassNameIsString && typeof lastAttrs.className === 'string') {
                    lastAttrs.className = (lastAttrs.className + ' ' + lastClassName).trim();
                } else if (lastClassNameIsString) {
                    lastAttrs.className = lastClassName;
                }
                
                newArgs.push(lastAttrs);
                
                for (let i = 2; i < arguments.length; ++i) {
                    newArgs.push(arguments[i]);
                }
                
                ret = createElement.apply(null, newArgs);
            } else {
                for (let i = 1; i < arguments.length; ++i) {
                    newArgs.push(arguments[i]);
                }
                
                ret = createElement.apply(null, newArgs);
            }
            
            for (let i = result.length - 2; i >= 0; --i) {
                const
                    triple = result[i],
                    attrs = {};
                
                if (triple[1]) {
                    attrs.id = triple[1];
                }
                
                if (triple[2]) {
                    attrs.className = triple[2];
                } 
                
                ret = createElement(triple[0], attrs, ret);
            }
        }
    }
    
    return ret;
}


