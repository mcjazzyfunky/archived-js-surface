'use strict';

import ComponentHelper from '../helpers/ComponentHelper.js';
import {Component} from 'js-bling';
import {Objects, Strings, Arrays, Seq} from 'js-prelude';

const dom = Component.createElement;




function renderHeader(metrics) {
    
}

export default Component.createFactory({
    typeId: 'FKVerticalNavi',
   
    properties: {
        menu: {
            type: Array,
            defaultValue: []
        }        
    },

    view: (behavior, {on, bind}) => {
        const display = behavior.map(props => {
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
        });
        
        return display;
    }
});


/*
function view(props, state, dependencies) {
    const
        bind = Component.createBinding();
    
    bind(evt => )
    
    
    return {
        display: ...
        actions: bind.toObservable();
    };
}


update(state, action, dependencies) {
    Observables.combine(states,)
}



event(action, dependencies) {
    switch (action.type) {
        'onClick': {
            const {name, bla} = action;
            
            ret =
        }
        
    }
    
    Objects.match(
        action,
        evt => evt.type,
        {  : {}     
        
        ) 
    return actions;
}


mode: ViewUpdateEvents

view(behavior, models, dependencies) {
    return {
        display: ...
        actions: ....
    }
}

event(action) {
    Objects.match(
        action,
        action => action.type,
        {
           incrementCounter => 
           decrementCounter =>
        }
    );   
}

export default Component.createFactory({
    typeId: 'FKVerticalNavi',
    
    view: (behavior, dependencies) => {
        const
            {display, actions} = view(props, state, dependencies);
            
        return {
            display: display, 
            events: events(actions, dependencies)
        };
    }
});
*/