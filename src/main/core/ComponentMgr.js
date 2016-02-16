'use strict';

import Component from './Component.js';
import ComponentAdapter from './ComponentAdapter.js';
import ComponentHelper from '../helpers/ComponentHelper.js';

export default class ComponentMgr {
    constructor() {
        this.__adapterRegistry = new Map();
        this.__convertRegistry = new Map();
    }

    convertComponentFactory(componentFactory, adapterId) {
        if (!Component.isFactory(componentFactory)) { 
            throw new TypeError(
                    '[ComponentMgr.covertComponentFactory] '
                    + "First argument must be a proper component factory created by 'Component.createFactory'");
        } else if (typeof adapterId !== 'string' && adapterId.length > 0) {
            throw new TypeError(
                    '[ComponentMgr.covertComponentFactory] '
                    + "Second argument must be a non-empty string");
        }
       
        const
            config = componentFactory.getConfig(),
            typeId = config.typeId,
            convertId = `${typeId}/${adapterId}`,
            ret = this.__convertRegistry.get(convertId);
            
        if (!ret) {
            const
                adapter = this.getAdapter(adapterId),
                convertedFactory = adapter.convertFactory(factory);
                
            this.__convertRegistry.set(convertId, convertedFactory);
        }

        return ret;
    }

    registerAdapter(adapter) {
        if (!(adapter instanceof ComponentAdapter)) {
            throw new TypeError(
                    '[ComponentMgr::registerAdapter] '
                    + 'First argument must be a component adapter');
        } else if (this.__adapterRegistry.has(adapter.getId())) {
            throw new Error(
                "[CompnentMgr:registerAdapter] Adapter with id '"
                + adapter.getId()
                + "' has already been registered");
        }
        
        this.__adapterRegistry.set(adapter.getId(), adapter);
    }
    
    getAdapter(adapterId) {
        const adapter = this.__adapterRegistry.get(adapterId);
        
        if (!adapter) {
            throw new Error(
                "[ComponentMgr:getComponentConfig] Component adapter with adapter id '"
                + adapterId
                + "' has not been registered");
        }
        
        return adapter;
    }
    
    static getGlobal() {
        let ret = this.__globalInstance;
        
        if (!ret) {
            ret = this.__globalInstance = new ComponentMgr();
        }
        
        return ret;
    }
}
