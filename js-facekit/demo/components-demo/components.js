'use strict';

import TextField from '../../src/main/js/components/TextField.js';
import Button from '../../src/main/js/components/Button.js';
import ButtonGroup from '../../src/main/js/components/ButtonGroup.js';
import Pager from '../../src/main/js/components/Pager.js';
import Pagination from '../../src/main/js/components/Pagination.js';
import PaginationInfo from '../../src/main/js/components/PaginationInfo.js';
/*
import Tabs from '../src/main/js/components/Tabs.js';
import Tab from '../src/main/js/components/Tab.js';
import VerticalNavi from '../src/main/js/components/VerticalNavi.js';
import TextField from '../src/main/js/components/TextField.js';
*/

import {Component} from 'js-surface';
import {Model, View} from 'js-surface-mvc';
import {Objects, Seq} from 'js-prelude';

import PaginationHelper from '../../src/main/js/helpers/PaginationHelper.js';
import ComponentHelper from '../../src/main/js/helpers/ComponentHelper.js';

import React from 'react';
import ReactDOM from 'react-dom';

const pagination = {
    pageSize: 25,
    totalItemCount: 1220
};


const
    {createElement: dom} = Component,
    buttonTypes = ['default', 'primary', 'success', 'info', 'warning', 'danger', 'link'],
    sizes = ['large', 'normal', 'small', 'tiny'],
    exampleIcons = ['fa-calendar', 'fa-twitter', 'glyphicon-home', 'glyphicon-print'],
    iconPositions = ['left', 'top', 'right', 'bottom'];


const DemoOfButtons = Component.createFactory({
    typeName: 'DemoOfButtons',

    view: View.define(({props}) => {
        return (
            dom('div',
                {className: 'container-fluid'},
                dom('div',
                    {className: 'row'},
                    dom('div',
                        {className: 'col-md-2'},
                        'Enabled buttons:'),
                    ...Seq.from(buttonTypes).map(buttonType =>
                        dom('div',
                            {className: 'col-md-1'},
                            Button({
                                text: buttonType,
                                type: buttonType,
                                onClick: () => alert('You clicked: ' + buttonType)
                            })))),
                dom('div',
                    {className: 'row'},
                    dom('div',
                        {className: 'col-md-2'},
                        'Disabled buttons:'),
                    ...Seq.from(buttonTypes).map(buttonType =>
                        dom('div',
                            {className: 'col-md-1'},
                            Button({
                                text: buttonType,
                                type: buttonType,
                                disabled: true
                            }))
                    )),

                dom('div',
                    {className: 'row'},
                    dom('div',
                        {className: 'col-md-2'},
                        'Buttons with icons'),
                    ...Seq.from(exampleIcons).map(icon =>
                        dom('div',
                            {className: 'col-md-1'},
                            Button({text: icon.replace(/^[^\-]+-/, ''), icon: icon})))),
                dom('div',
                    {className: 'row'},
                    dom('div',
                        {className: 'col-md-2'},
                        'Buttons with different icon positions'),
                    ...Seq.from(iconPositions).map(iconPosition =>
                        dom('div',
                            {className: 'col-md-1'},
                            Button({text: iconPosition, icon: 'fa-cab', iconPosition: iconPosition})))),

                dom('div',
                    {className: 'row'},
                    dom('div',
                        {className: 'col-md-2'},
                        'Links with different icon positions'),
                    ...Seq.from(iconPositions).map(iconPosition =>
                        dom('div',
                            {className: 'col-md-1'},
                            Button({
                                text: iconPosition,
                                icon: 'fa-cab',
                                iconPosition: iconPosition,
                                type: 'link'
                            })))),
                dom('div',
                    {className: 'row'},
                    dom('div',
                        {className: 'col-md-2'},
                        'Button sizes:'),
                    ...Seq.from(sizes).map(size =>
                        dom('div', {className: 'col-md-1'},
                            Button({text: size, size: size})))),

                dom('div',
                    {className: 'row'},
                    dom('div', {className: 'col-md-2'},
                        'Link sizes:'),
                    ...Seq.from(sizes).map(size =>
                        dom('div', {className: 'col-md-1'},
                            Button({text: size, size: size, type: 'link'})))),
                dom('div',
                    {className: 'row'},
                    dom('div',
                        {className: 'col-md-2'},
                        'Menu buttons:'),
                    Button({
                        className: 'col-md-2',
                        type: 'info',
                        text: 'Dropdown button',
                        menu: [{text: 'Item 1'}]
                    }),
                    Button({
                        className: 'col-md-2',
                        text: 'Split button',
                        onClick: () => alert('Juhuuu'),
                        menu: [{text: 'Item 1'}]
                    })))
        );
    })
});

const DemoOfButtonGroups = Component.createFactory({
    typeName: 'DemoOfButtonGroups',
    
    view:
        View.define(({props}) =>
            dom('div',
                {className: 'container-fluid'},
                dom('div',
                    {className: 'row'},
                    ButtonGroup(
                        {className: 'col-md-2'},
                        Button({text: 'New'}),
                        Button({text: 'View'}),
                        Button({text: 'Edit'}),
                        Button({text: 'Delete'})
                    ),
                    ButtonGroup(
                        {className: 'col-md-2'},
                        Button({text: 'New', type: 'info'}),
                        Button({text: 'Edit', type: 'warning'}),
                        Button({text: 'Delete', type: 'danger'}),
                        Button({text: 'Export', type: 'success', menu: [{text: 'Juhu'}]})
                    ),
                    ButtonGroup(
                        {className: 'col-md-3'},
                        Button({text: 'Single Button', type: 'default'})))))
});




class DemoOfPaginationModel extends Model {
    constructor() {
        super();
    }
    
    get initialState() {
        return {
            currentPage: 0    
        };
    }
    
    getCurrentPage() {
        return this.state.currentPage;
    }
    
    moveToPage(targetPage) {
        this.state = Objects.transform(this.state, {
            currentPage: {$set: targetPage}
        });
    }
}

const DemoOfPagination = Component.createFactory({
    typeName: 'DemoOfPagination',
    
    view: View.define({
        getModel() {
            return new DemoOfPaginationModel();
        },
        
        render: ({ctrl}) => {
            const
                doOnChange = event => ctrl.moveToPage(event.targetPage);
    
            return (
                dom('div',
                    {className: 'container-fluid'},
                    ...Seq.range(1, 10).map(_ =>
                        dom('div',
                            {className: 'row'},
                            Pagination({
                                className: 'col-md-3 ',
                                pageIndex: ctrl.getCurrentPage(),
                                pageSize: pagination.pageSize,
                                totalItemCount: pagination.totalItemCount,
                                onChange: doOnChange
                            })
                            /*,
                            Pager({
                                className: 'col-md-3',
                                pageIndex: ctrl.getCurrentPage(),
                                pageSize: pagination.pageSize,
                                totalItemCount: pagination.totalItemCount,
                                onChange: doOnChange
                            })
                            */
                        )))
            );
        }
    })
});


class DemoOfInputFieldsModel extends Model {
    constructor() {
        super(null);
        
        this.state = {
            firstName: '',
            lastName: ''
        };
    }
    
    getFirstName() {
        return this.state.firstName;
    }
    
    setFirstName(value) {
        this.state = Objects.transform(this.state, {
            firstName: {$set: value}
        });
    }
    
    getLastName() {
        return this.lastName;
    }
    
    setLastName(value) {
        this.state = Objects.transform(this.state, {
            lastName: {$set: value}
        });
    }
}

const DemoOfInputFields = Component.createFactory({
    typeName: 'DemoOfInputFields',
    
    view: View.define({
        getModel() {
            return new DemoOfInputFieldsModel();
        },
        
        render({ctrl}) {
            return (
                dom('div',
                    null,
                    TextField({
                        value: ctrl.getFirstName(),
                        placeholder: 'Enter first name',
                        label: 'First name:',
                        onChange: event => ctrl.setFirstName(event.value)
                    }),
                    dom('div', null, 'Hello ' + ctrl.getFirstName()))
            );
        }
    })
});

/*
const DemoOfTabs = Component.createFactory({
    typeId: 'DemoOfTabs',

    render: props => {
        const content =
            dom('div',
                null,
                Tabs(null,
                    Tab(
                        {caption: "Tab1"},
                        "Some content"),
                    Tab(
                        {caption: "Tab2"},
                        "Some other content"),
                    Tab(
                        {caption: "Tab3"},
                        "Some complete other content")));
        return content;
    }
});

const DemoOfInputFields = Component.createFactory({
    typeId: 'DemoOfInputFields',

    render: props => (
        dom('div',
            null,
            TextField({onChange: event => console.log('change', event)}))
    )
})

const
    demo1 = DemoOfButtons(),
    demo2 = DemoOfButtonGroups(),
    demo3 = DemoOfPagination(),
    demo4 = DemoOfTabs(),
    demo5 = DemoOfInputFields(),
    demos = Tabs(null,
        Tab({caption: 'Buttons'}, demo1),
        Tab({caption: 'Button groups'}, demo2),
        Tab({caption: 'Pagination'}, demo3));

        
const demos = VerticalNavi({
    menu: {
        type: 'section',
        title: 'Section 1',
        items: [{
            caption: 'Module 1'
        }, {
            caption: 'Module 2'
        }, {
            caption: 'module 3'
        }]
    }
});
*/

Component.mount(
    DemoOfInputFields,
    'main-content');
