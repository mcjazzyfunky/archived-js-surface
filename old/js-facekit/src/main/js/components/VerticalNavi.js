'use strict';

import ComponentHelper from '../helpers/ComponentHelper.js';
import {Surface} from 'js-surface';
import {SurfaceX} from 'js-surface-x';
import {Objects, Strings, Arrays, Seq} from 'js-prelude';

const dom = Surface.createElement;

export default SurfaceX.createFactory({
    typeName: 'FKVerticalNavi',
   
    properties: {
        menu: {
            type: 'object'
        }        
    },
    
    initialState: {
        _version_: null,
        item: []  
    },
    
    stateTransitions: {
        storeMenuAsState(menu) {
            return state => {
                let ret;
                
                if (state._version_ === menu.get('_version_')) {
                    ret = state;
                } else {
                    ret = {
                        _version_: menu.getString('_version_')
                    };
                    
                    const
                        headline = menu.getString('headline', ''),
                        sections = menu.getSeq('sections', Seq.empty());
                    
                    sections.forEach(section => {
                        
                    });
                    
                    
                    //loadMenu(menu, ret);
                }
            
                return ret;
            }
        }  
    },
    
    onMount({props, ctrl}) {
        ctrl.storePropsAsState(props.getConfig('menu'));        
    },
    
    onNextProps({props, ctrl}) {
        ctrl.storePropsAsState(props.getConfig('menu'));        
    },

    render({props}) {
        return (
            dom('div',
                {className: 'vertical-navi'},
                dom('ul',
                    null,
                    Seq.from(props.get(['menu', 'items'], null))
                        .map(menuProps =>
                            dom('li',
                                null,
                                dom('a',
                                    null,
                                    menuProps.caption)))))
        );
    }
});
