'use strict';

import {Component} from 'js-bling';
import ComponentHelper from '../helpers/ComponentHelper.js';
import {Arrays, Seq} from 'js-prelude';
import $ from 'jquery';

const dom = Component.createElement;

export default Component.createFactory({
    typeId: 'FKTabs',

    properties: {
        activeTab: {
            type: 'number',
            defaultValue: 0
        },
        
        tabPosition: {
            type: 'string',
            options: ['top'],
            defaultValue: 'top'
        },
        
        tabStyle: {
            type: 'string',
            options: ['default'],
            defaultValue: 'default'
        },
        
        tabOrientation: {
            type: 'string',
            options: ['horizontal'],
            defaultValue: 'horizontal'
        },
        
        preventSize: {
            type: 'boolean',
            defaultValue: false
        }
    },
    
    view:
        behavior => behavior.map(renderTabs),
            
    onMount: ({domElement}) => {
        const
            $elem = $(domElement);

        $elem
            .find('.fk-tabs-header:first > ul > li')
            .each((index, li) => {
                $(li).on('click', evt => {
                    evt.preventDefault();
                    $elem.find('.fk-tabs-body:first > .fk-tabs-page').hide();
                    $elem.find($('.fk-tabs-body:first > .fk-tabs-page').get(index)).show();
                });
            })
            .on('click', evt => {
                evt.preventDefault();console.log($.fn)
                $(evt.target).tab('show')
            });
    }
});


function renderTabs(props) {
    const
       activeTab = props.activeTab,
       tabPosition = Arrays.selectValue(['top', 'bottom', 'left', 'right'], props.tabPosition, 'top'),
       tabStyle = Arrays.selectValue(['default', 'pills'], props.tabStyle, 'default'),
       tabOrientation = Arrays.selectValue(['horizontal', 'vertical'], props.tabOrientation, 'horizontal'),
       preventSize = !!props.preventSize;

    const header =
        dom('div',
            {className: 'fk-tabs-header'},
            dom('ul',
                {className: 'nav nav-' + (tabStyle === 'pills' ? 'pills' : 'tabs')},
                ...Seq.from(props.children).map((child, idx) => renderTab(child, dom, activeTab, idx))));

    const body =
        dom('div',
            {className: 'fk-tabs-body'},
             ...props.children.map((child, index) =>
                dom('div',
                    {className: 'fk-tabs-page', style: {display: activeTab === index || activeTab === child.props.name ? 'block' : 'none'}},
                    child)));

    const parts = tabPosition === 'bottom'
            ? [body, header]
            : [header, body];

    const ret = (
        dom('div',
            {className: 'fk-tabs fk-tabs-' + tabPosition + ' fk-tabs-' + tabOrientation + (!preventSize ? '' : ' fk-tabs-prevent-size ')},
            ...parts)
    );

    return ret;
}

function renderTab(tab, html, activeTab, idx) {
    const
        props = tab.props,
        active = activeTab === props.name || idx === parseInt(activeTab, 10),
        className = ComponentHelper.buildCssClass(active ? 'active' : null);

    return (
        dom('li',
            {className: className},
            dom('a',
                null,
                dom('div',
                    null,
                    props.caption)))
    );
}

