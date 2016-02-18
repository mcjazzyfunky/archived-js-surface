'use strict';

import Component from '../base/Component';

export const Tab = Component.createClass({
    typeName: 'facekit/Tab',
    view: ({changes}) => 
        ['div', {className: 'fk-tab'}, ...changes.__value.children]
});

export default Tab;
export const tab = Tab.createElement;