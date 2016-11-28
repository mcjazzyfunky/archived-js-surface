'use strict';

import {Surface} from 'js-surface';
import {SurfaceX} from 'js-surface-x';

import VertNavi from '../../../src/main/js/components/VerticalNavi.js';


const
    dom = Surface.createElement,
    
    sideMenu = {
        _version_: new Date().toISOString(),
            
        headline: 'Main menu',
        
        sections: [{
                headline: 'Section 1',
                
                items: [{
                    caption: 'Item 1.1',
                    itemId: 11
                }, {
                    caption: 'Item 1.2',
                    itemId: 12
                }]
            }, {
                headline: 'Section 2',
                
                items: [{
                    caption: 'Item 2.1',
                    itemId: 21
                }, {
                    caption: 'Item 2.2',
                    itemId: 22
                }]
            }]
    };



export default SurfaceX.createFactory({
    typeName: 'App',
    
    render() {
        return dom('div',
            null,
            "Juhu",
            VertNavi({menu: sideMenu}));
    }
});

