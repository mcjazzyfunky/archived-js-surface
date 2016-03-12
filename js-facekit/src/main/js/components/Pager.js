'use strict';

import Button from '../components/Button.js';
import ButtonGroup from '../components/ButtonGroup.js';
import PaginationInfo from '../components/PaginationInfo.js';
import PaginationHelper from '../helpers/PaginationHelper.js';
import ComponentHelper from '../helpers/ComponentHelper.js';
import {Component} from 'js-bling';
import {Subject} from 'rxjs';

const {createElement: dom, createEventBinder: binder}= Component;

export default Component.createFactory({
    typeId: 'FKPager',
    
    properties: {
        type: {
            type: 'string',
            defaultValue: ''
        },

        pageIndex: {
            type: 'number',
            defaultValue: null
        },

        pageSize: {
            type: 'number',
            defaultValue: null
        },
        
        totalItemCount: {
            type: 'number',
            defaultValue: null
        },

        showFirstButton: {
            type: 'boolean',
            defaultValue: true
        },
        
        showNextButton: {
            type: 'boolean',
            defaultValue: true
        },
        
        showPreviousButton: {
            type: 'boolean',
            defaultValue: true
        },
        
        showLastButton: {
            type: 'boolean',
            defaultValue: true
        },

        showButtonTexts: {
            type: 'boolean',
            defaultValue: false
        },

        disabled: {
            type: 'boolean',
            defaultValue: false
        },

        className: {
            type: 'string',
            defaultValue: null
        },
        
        onChange: {
            type: 'function',
            defaultValue: null
        }
    },

    render:
        renderPager
});

function renderPager(props) {
    const
        changes = new Subject(),

        bindMoveToPage =
            binder(changes, (_, pageIndex) => ({targetPage: pageIndex})),
        
        metrics =
            PaginationHelper.calcPaginationMetrics(
                props.get('pageIndex'),
                props.get('pageSize'),
                props.get('totalItemCount')),

        type = props.get('type'),
        
        disabled = props.get('disabled'),
        
        showFirstButton = props.get('showFirstButton'),
        
        showNextButton = props.get('showNextButton'),
        
        showPreviousButton = props.get('showPreviousButton'),
        
        showLastButton =  props.get('showLastButton'),
        
        showButtonTexts = props.get('showButtonTexts'),
    
        content =
            dom('div',
                {className: 'fk-pager ' + props.get('className')},
                ButtonGroup(
                    null,
                    showFirstButton && Button({
                        text: (showButtonTexts ? 'First' : ''),
                        icon: 'fa-angle-double-left',
                        className: 'fk-pager-Button-first',
                        tooltip: (showButtonTexts ? '' : 'First'),
                        disabled: disabled || metrics.isFirstPage,
                        onClick: bindMoveToPage(0)
                    }),
                    
                    showPreviousButton && Button({
                        text: (showButtonTexts ? 'Previous' : ''),
                        icon: 'fa-angle-left',
                        className: 'fk-pager-Button-previous',
                        tooltip: (showButtonTexts ? '' : 'Previous'),
                        disabled: disabled || metrics.isFirstPage,
                        onClick: bindMoveToPage(metrics.pageIndex - 1)
                    })),
                (type !== 'randomAccess'
                                ? PaginationInfo({
                                    pageIndex: metrics.pageIndex,
                                    pageSize: metrics.pageSize,
                                    totalItemCount: metrics.totalItemCount
                                })
                                : 'xxx'),
    
                ButtonGroup(
                    null,
                    showNextButton && Button({
                        text: (showButtonTexts ? 'Next' : ''),
                        icon: 'fa-angle-right',
                        className: 'fk-pager-Button-next',
                        tooltip: (showButtonTexts ? '' : 'Next'),
                        disabled: disabled || metrics.isLastPage,
                        onClick: bindMoveToPage(metrics.pageIndex + 1)
                    }),
                    showLastButton && Button({
                        text: (showButtonTexts ? 'Last' : ''),
                        icon: 'fa-angle-double-right',
                        className: 'fk-pager-Button-last',
                        tooltip: (showButtonTexts ? '' : 'Last'),
                        disabled: disabled || metrics.isLastPage,
                        onClick: bindMoveToPage(metrics.pageCount - 1)
                    })));

        return {
            content,
            events: {
                change: changes.asObservable()
            }
        };
}

                
            