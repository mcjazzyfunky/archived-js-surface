'use strict';

import {Component} from 'js-surface';
import {ExtComponent} from 'js-surface-ext';

import VertNavi from '../../../src/main/js/components/VerticalNavi.js';


const
    dom = Component.createElement,
    
    sideMenu = [{
            caption: 'Menu-1',
            
            menu: [{
                caption: 'Menu-1.1'    
            }, {
                caption: 'Menu-1.2'
            }]
        }, {
            caption: 'Menu-2'
        }];



export default ExtComponent.createFactory({
    typeName: 'App',
    
    render() {
        return dom('div',
            null,
            VertNavi({menu: sideMenu}));
    }
});

