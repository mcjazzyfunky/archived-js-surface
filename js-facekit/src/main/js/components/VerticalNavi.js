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
            type: 'iterable',
            defaultValue: []
        }        
    },

    render({props}) {
        return (
            dom('div',
                null,
                Seq.from(props.menu)
                    .map(menuProps =>
                        dom('li',
                            null,
                            dom('a',
                                null,
                                menuProps.caption))))
        );
    }
});
