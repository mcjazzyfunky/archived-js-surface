'use strict';

import Component from '../base/Component';
import ComponentHelper from '../helpers/ComponentHelper';
import {Arrays, Seq} from 'js-prelude';

function renderTab(tab, html, activeTab, idx) {
    const
        props = tab.getProps(),
        active = activeTab === props.get('name') || idx === parseInt(activeTab, 10),
        className = ComponentHelper.buildCssClass(active ? 'active' : null);

    return (
        ['li',
            {className: className},
            ['a',
                null
                ['div',
                    null,
                    props.get('caption')]]]
    );
}

const tabsView = {
    renderView: ({ => {
        const
           activeTab = props.get('activeTab'),
           tabPosition = Arrays.selectValue(['top', 'bottom', 'left', 'right'], props.get('tabPosition'), 'top'),
           tabStyle = Arrays.selectValue(['default', 'pills'], props.get('tabStyle'), 'default'),
           tabOrientation = Arrays.selectValue(['horizontal', 'vertical'], props.get('tabOrientation'), 'horizontal'),
           preventSize = !!props.get('preventSize');

        const header = html.div({className: 'fk-tabs-header'}, html.ul(
                                       {className: 'nav nav-' + (tabStyle === 'pills' ? 'pills' : 'tabs')},
                                       ...Seq.from(children).map((child, idx) => renderTab(child, html, activeTab, idx))));

        const body = html.div(
                    {className: 'fk-tabs-body'},
                     ...children.map((child, index) => html.div(
                            {className: 'fk-tabs-page', style: {display: activeTab === index || activeTab === child.getProps().get('name') ? 'block' : 'none'}},
                            child)));

        const parts = tabPosition === 'bottom'
                ? [body, header]
                : [header, body];

        const ret = (
            html.div(
                {className: 'fk-tabs fk-tabs-' + tabPosition + ' fk-tabs-' + tabOrientation + (!preventSize ? '' : ' fk-tabs-prevent-size ')},
                ...parts)
        );

        return ret;
    },
    initView: domElem => {
        const
            $ = jQuery,
            $elem = $(domElem);

        $elem.find('.fk-tabs-header:first > ul > li')
            .each((index, li) => {
                $(li).on('click', evt => {
                    evt.preventDefault();
                    $elem.find('.fk-tabs-body:first > .fk-tabs-page').hide();
                    $elem.find($('.fk-tabs-body:first > .fk-tabs-page').get(index)).show();
                });
            })
            .on('click', evt => {
                evt.preventDefault();
                $(evt.target).tab('show')
            });
    }
};

export const Tabs = Component.createClass({
    typeName: 'facekit/Tabs',
    view: tabsView,
    defaultProps: {
        activeTab: 0,
        tabPosition: 'top',
        tabStyle: 'default',
        tabOrientation: 'horizontal',
        preventSize: true
    }
});

export default Tabs;
export const tabs = Tabs.createElement;