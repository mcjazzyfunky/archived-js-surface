'use strict';

export class ModuleLoader {
    static loadModule(moduleName) {
        var ret;
        
        if (typeof moduleName !== 'string' || moduleName.trim() === '') {
            throw new TypeError(
                    '[ModuleLoader:loadModule] ',
                    + 'First argument must be a non-empty string')
        }
        
        if (typeof require === 'function') {
            ret = require(moduleName);
        } else if (typeof System === 'object' && typeof System.import === 'function') {
            ret = System.import(moduleName);
        } else {
            throw new Error(
                '[ModuleLoader.loadModule] '
                + `Could not load module '${moduleName}' - neither SystemJS nor `
                + 'CommonJS available');
        }
        
        if (!ret) {
            throw new Error(
                '[ModuleLoader.loadModule] '
                + `Could not load module '${moduleName}`); 
        }
        
        return ret;
    }
    
}