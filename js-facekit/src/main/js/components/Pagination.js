'use strict';

import ComponentHelper from '../helpers/ComponentHelper.js';
import PaginationHelper from '../helpers/PaginationHelper.js';
import {Component} from 'js-bling';
import {Seq} from 'js-prelude';
import {Subject} from 'rxjs';

const {createElement: dom, createEventBinder: binder} = Component;

export default Component.createFactory({
    typeId:
        'FKPagination',
    
    properties: {
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
        
        showLastButton: {
            type: 'boolean',
            defaultValue: true
        },
        
        showPreviousButton: {
            type: 'boolean',
            defaultValue: true
        },
        
        onChange: {
            type: 'function',
            defaultValue: null
        }
    },

    render:
        renderPagination
});
            
function renderPagination(props) {
    const changes = new Subject();

    const
        bindMoveToPage = binder(changes, (_, pageIndex) => ({targetPage: pageIndex})),

        pageIndex = props.pageIndex,
        
        metrics = PaginationHelper.calcPaginationMetrics(
                        props.pageIndex,
                        props.pageSize,
                        props.totalItemCount),
        
        paginationInfo = PaginationHelper.determineVisiblePaginationButtons(
                                props.pageIndex,
                                metrics.pageCount,
                                6),
        
        classNameOuter = ComponentHelper.buildCssClass(
                                'fk-pagination',
                                props.className),
        
        classNameInner = 'pagination',
        
        firstPageLink = metrics.pageCount > 0
                            ? renderLinkListItem(
                                    1,
                                    pageIndex === 0,
                                    bindMoveToPage(1))
                            : null,
        
        precedingEllipsis = paginationInfo.firstButtonIndex > 1
                                ? renderLinkListItem(
                                        '...',
                                        false,
                                        bindMoveToPage(0)) // TODO
                                : null,
        
        succeedingEllipsis = paginationInfo.lastButtonIndex < metrics.pageCount - 2
                                    ? renderLinkListItem(
                                            '...',
                                            false,
                                            bindMoveToPage(0)) // TODO
                                    : null,
        
        lastPageLink =  metrics.pageCount > 0
                            ? renderLinkListItem(
                                metrics.pageCount,
                                pageIndex === metrics.pageCount - 1,
                                bindMoveToPage(metrics.pageCount - 1))
                            : null,

        buttons = Seq.range(
                        paginationInfo.firstButtonIndex ,
                        paginationInfo.lastButtonIndex + 1)
                    .map(index => renderLinkListItem(
                                        index + 1,
                                        index === pageIndex,
                                        bindMoveToPage(index))),
        
        content =
            dom('div',
                {className: classNameOuter},
                dom('ul',
                    {className: classNameInner},
                    firstPageLink,
                    precedingEllipsis,
                    ...buttons,
                    succeedingEllipsis,
                    lastPageLink));
                    
        return {
            content,
            events: {
                change: changes.asObservable()
            }
        };
}

function renderLinkListItem(text, isActive, onMoveToPage) {
    return (
        dom('li', {
                className: isActive ? 'active' : '',
                key: text !== '...' ? text + '-' + isActive : undefined
            },
            dom('a',
                {onClick: onMoveToPage},
                text))
    );
}