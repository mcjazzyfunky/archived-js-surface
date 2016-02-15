'use strict';

import Component from './Component.js';
import ComponentAdapter from './ComponentAdapter.js';
import ComponentHelper from '../helpers/ComponentHelper.js';

export default class ComponentMgr {
    constructor() {
        this.__factoryRegistry = new Map();
        this.__adapterRegistry = new Map();
        this.__convertRegistry = new Map();
        this.__uiBuilderRegistry = new Map();
    }

    registerComponentFactory(componentFactory) {
        if (!Component.isFactory(componentFactory)) { 
            throw new TypeError(
                    '[ComponentMgr.registerComponentFactory] '
                    + "First argument must be a proper component factory created by 'Component.createFactory'");
        }
       
        const config = componentFactory.getConfig();
        
        if (this.__factoryRegistry.has(config.typeId)) {
            throw new Error(
                "[CompnentMgr:registerComponentFactory] Component factory with id '"
                + config.typeId
                + "' has already been registered");
        }

        this.__factoryRegistry.set(config.typeId, componentFactory);
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
    
    getComponentFactory(typeId) {
        const componentFactory = this.__factoryRegistry.get(typeId);
        
        if (!componentFactory) {
            throw new Error(
                "[ComponentMgr:getComponentConfig] Component factory with id '"
                + typeId
                + "' has not been registered");
        }
        
        return componentFactory;
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
    
    
    convertComponentFactory(typeId, adapterId) {
        const convertId = `${typeId}/${adapterId}`;

        let ret = this.__convertRegistry.get(convertId);

        if (!ret) {
            const
                componentFactory = this.__factoryRegistry.get(typeId),
                adapter = this.__adapterRegistry.get(adapterId);

            if (!componentFactory) {
                throw new Error(
                    "[ComponentMgr:convertComponentFactory] Component factory with id '"
                    + typeId
                    + "' has not been registered");
            } else if (!adapter) {
                throw new Error(
                    "[ComponentMgr:convertComponentFactory] Adapter with id '"
                    + adapterId
                    + "' has not been registered");
            }
            
            ret = adapter.convertComponentFactory(componentFactory, this);
            this.__convertRegistry.set(convertId, ret);
        }
        
        return ret; 
    }
    
    isComponentFactoryRegistered(typeId) {
        return this.__factoryRegistry.has(typeId);
    }
    
    getUIBuilder(componentMgr, adapterId) {
        let ret = this.__uiBuilderRegistry.get(adapterId);
        
        if (!ret) {
            const adapter = this.__adapterRegistry.get(adapterId);
        
            if (!adapter) {
                throw new Error(
                        "[ComponentMgr.getUIBuilder] No adapter with id '"
                        + adapterId
                        + "' registered"); 
            }
            
            ret = {};

            for (let tagName of ComponentHelper.getSupportedTagNames()) {
                ret[tagName] = (props, ...children) => {
                    const mappedChildren = children.map(child => {
                        var ret;
                        
                        if (child === null || typeof child !== 'object' || child.isBlingComponent !== true) {
                            ret = child;
                        } else {
                            const
                                factory = componentMgr.getComponentFactory(child.typeId),
                                config = factory.getConfig(),
                                typeId = config.typeId;
                            
                            const convert = componentMgr.convertComponentFactory(typeId, adapterId);
                            ret = convert(child.initialProps, child.children);
                        }
                        
                        return ret;
                    });
                    
                    return adapter.createElement(tagName, props, mappedChildren);
                };
            }
            
            return ret;
        } 
    }
    
    static getGlobal() {
        let ret = this.__globalInstance;
        
        if (!ret) {
            ret = this.__globalInstance = new ComponentMgr();
        }
        
        return ret;
    }
}
