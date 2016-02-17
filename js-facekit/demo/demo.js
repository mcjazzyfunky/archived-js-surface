'use strict';


import '../../src/main/preparers/prepare-for-react.js';
import Button from '../src/main/js/components/Button.js';
import ButtonGroup from '../src/main/js/components/ButtonGroup.js';
import Pager from '../src/main/js/components/Pager.js';
import Pagination from '../src/main/js/components/Pagination.js';
import PaginationInfo from '../src/main/js/components/PaginationInfo.js';
import {Component, ComponentMgr} from 'js-bling';
import {Seq} from 'js-prelude';

const
    buttonTypes = ['default', 'primary', 'success', 'info', 'warning', 'danger', 'link'],
    sizes = ['large', 'default', 'small', 'extra-small'],
    exampleIcons = ['fa-calendar', 'fa-twitter', 'glyphicon-home', 'glyphicon-print'],
    iconPositions = ['left', 'top', 'right', 'bottom'];


const demoOfButtonsDisplay = (props, bind) => (
    ['div',
        {className: 'container-fluid'},
        ['div',
            {className: 'row'},
            ['div',
                {className: 'col-md-2'},
                'Enabled buttons:'],
            ...Seq.from(buttonTypes).map(buttonType =>
                ['div',
                    {className: 'col-md-1'},
                    Button({
                        text: buttonType,
                        type: buttonType,
                        onClick: () => alert('You clicked: ' + buttonType)})])],
        ['div',
            {className: 'row'},
            ['div',
                {className: 'col-md-2'},
                'Disabled buttons:'],
            ...Seq.from(buttonTypes).map(buttonType =>
                ['div',
                    {className: 'col-md-1'},
                    Button({
                        text: buttonType,
                        type: buttonType,
                        disabled: true
                    })]
            )],
        ['div',
            {className: 'row'},
            ['div',
                {className: 'col-md-2'},
                'Buttons with icons'],
            ...Seq.from(exampleIcons).map(icon =>
                ['div',
                    {className: 'col-md-1'},
                    Button({text: icon.replace(/^[^\-]+-/, ''), icon: icon})])],
        ['div',
            {className: 'row'},
            ['div',
                {className: 'col-md-2'},
                'Buttons with different icon positions'],
            ...Seq.from(iconPositions).map(iconPosition =>
                ['div',
                    {className: 'col-md-1'},
                    Button({text: iconPosition, icon: 'fa-cab', iconPosition: iconPosition})])],
        ['div',
            {className: 'row'},
            ['div',
                {className: 'col-md-2'},
                'Links with different icon positions'],
            ...Seq.from(iconPositions).map(iconPosition =>
                ['div',
                    {className: 'col-md-1'},
                    Button({
                        text: iconPosition,
                        icon: 'fa-cab',
                        iconPosition: iconPosition,
                        type: 'link'})])],
        ['div',
            {className: 'row'},
            ['div',
                {className: 'col-md-2'},
                'Button sizes:'],
            ...Seq.from(sizes).map(size =>
                ['div', {className: 'col-md-1'},
                    Button({text: size, size: size})])],
        ['div',
            {className: 'row'},
            ['div', {className: 'col-md-2'},
                'Link sizes:'],
            ...Seq.from(sizes).map(size =>
                ['div', {className: 'col-md-1'},
                    Button({text: size, size: size, type: 'link'})])],
        ['div',
            {className: 'row'},
            ['div',
                {className: 'col-md-2'},
                'Menu buttons:'],
            ['button', {
                    className: 'col-md-2',
                    type: 'info', text: 'Dropdown button',
                    menu: [{text: 'Item 1'}]}],
            ['button', {
                    className: 'col-md-2',
                    text: 'Split button',
                    onClick: () => alert('Juhuuu'),
                    menu: [{text: 'Item 1'}]}]]]
);

export const DemoOfButtons = Component.createFactory({
    typeId: 'DemoOfButtons',

    view: ({changes, events: {on, bind}}) => ({
        display: changes.map(props => demoOfButtonsDisplay(props))
    })
});


export const DemoOfButtonGroups = Component.createFactory({
    typeId: 'DemoOfButtonGroups',
    
    view: ({changes, events: {on, bind}}) => ({
        display: changes.map(props =>
            ['div',
                {className: 'container-fluid'},
                ['div',
                    {className: 'row'},
                    ButtonGroup({className: 'col-md-2'},
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
                        Button({text: 'Single Button', type: 'default'})
                    )]])
    })
});


export const DemoOfPagination = Component.createFactory({
    typeId: 'DemoOfPagination',
    
    defaultProps: {
        pageIndex: 0,
        pageSize: 25,
        totalItemCount: 744
    },
    
    view: ({changes, events:{on, bind}}) => ({
        display: changes.map(props =>
            ['div',
                {className: 'container-fluid'},
                ...Seq.range(1, 100).map(_ =>
                    ['div',
                        {className: 'row'},
                        Pagination({
                            className: 'col-md-3',
                            pageIndex: props.get('pageIndex'),
                            pageSize: props.get('pageSize'),
                            totalItemCount: props.get('totalItemCount'),
                            onChange: evt => console.log(evt) 
                        }),
                        Pager({
                            className: 'col-md-3',
                            pageIndex: props.get('pageIndex'),
                            pageSize: props.get('pageSize'),
                            totalItemCount: props.get('totalItemCount'),
                            onChange: evt => alert('juhu') 
                        })
                    ])]) 
    })
});

Component.mount(
    DemoOfPagination({
        pageIndex: 10,
        pageSize: 25,
        totalItemCount: 1000        
    }),
    'main-content',
    'React');
