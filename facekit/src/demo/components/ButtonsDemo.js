import { defineComponent, defineIntend, createElement as htm, Types, isElement } from 'js-surface';

import { Seq } from 'js-prelude';

import Button from '../../main/js/components/Button.js';
import Tabs from '../../main/js/components/Tabs.js';
import Tab from '../../main/js/components/Tab.js';


const pagination = {
    pageSize: 25,
    totalItemCount: 1220
};

const
    buttonTypes = ['default', 'primary', 'success', 'info', 'warning', 'danger', 'link'],
    sizes = ['large', 'normal', 'small'],
    exampleIcons = ['fa-calendar', 'fa-twitter', 'glyphicon-home', 'glyphicon-print'],
    iconPositions = ['left', 'top', 'right', 'bottom'];

export default defineComponent({
    name: 'DemoOfuttons',

    render({ props }) {
        return (
            htm('div',
                {className: 'container-fluid'},
                htm('div',
                    {className: 'row'},
                    htm('div',
                        {className: 'col-md-2'},
                        'Enabled buttons:'),
                    ...Seq.from(buttonTypes).map(buttonType =>
                        htm('div',
                            {className: 'col-md-1'},
                            Button({
                                text: buttonType,
                                type: buttonType,
                                onClick: () => alert('You clicked: ' + buttonType)
                            })))),
                htm('div',
                    {className: 'row'},
                    htm('div',
                        {className: 'col-md-2'},
                        'Disabled buttons:'),
                    ...Seq.from(buttonTypes).map(buttonType =>
                        htm('div',
                            {className: 'col-md-1'},
                            Button({
                                text: buttonType,
                                type: buttonType,
                                disabled: true
                            }))
                    )),

                htm('div',
                    {className: 'row'},
                    htm('div',
                        {className: 'col-md-2'},
                        'Buttons with icons'),
                    ...Seq.from(exampleIcons).map(icon =>
                        htm('div',
                            {className: 'col-md-1'},
                            Button({text: icon.replace(/^[^\-]+-/, ''), icon: icon})))),
                htm('div',
                    {className: 'row'},
                    htm('div',
                        {className: 'col-md-2'},
                        'Buttons with different icon positions'),
                    ...Seq.from(iconPositions).map(iconPosition =>
                        htm('div',
                            {className: 'col-md-1'},
                            Button({text: iconPosition, icon: 'fa-cab', iconPosition: iconPosition})))),

                htm('div',
                    {className: 'row'},
                    htm('div',
                        {className: 'col-md-2'},
                        'Links with different icon positions'),
                    ...Seq.from(iconPositions).map(iconPosition =>
                        htm('div',
                            {className: 'col-md-1'},
                            Button({
                                text: iconPosition,
                                icon: 'fa-cab',
                                iconPosition: iconPosition,
                                type: 'link'
                            })))),
                htm('div',
                    {className: 'row'},
                    htm('div',
                        {className: 'col-md-2'},
                        'Button sizes:'),
                    ...Seq.from(sizes).map(size =>
                        htm('div', {className: 'col-md-1'},
                            Button({text: size, size: size})))),

                htm('div',
                    {className: 'row'},
                    htm('div', {className: 'col-md-2'},
                        'Link sizes:'),
                    ...Seq.from(sizes).map(size =>
                        htm('div', {className: 'col-md-1'},
                            Button({text: size, size: size, type: 'link'})))),
                htm('div',
                    {className: 'row'},
                    htm('div',
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
    }
});
    