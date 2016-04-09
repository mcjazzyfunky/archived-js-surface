'use strict';

import ComponentHelper from '../helpers/ComponentHelper.js';
import PaginationHelper from '../helpers/PaginationHelper.js';
import {Component} from 'js-surface';
import {commonView} from 'js-surface-views';
import {Seq} from 'js-prelude';

const {createElement: dom} = Component;

export default Component.createFactory({
    typeName:
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
        
        maxPageButtonCount: {
            type: 'number',
            defaultValue: 6
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

    view:
        commonView(renderPagination)
});
            
function renderPagination({props}) {
    const
        onChange = props.get('onChange', null),

        bindMoveToPage = pageIndex =>
            !onChange
            ? null
            : _ => onChange({targetPage: pageIndex}),

        pageIndex = props.get('pageIndex'),

        pageSize = props.get('pageSize'),

        totalItemCount = props.get('totalItemCount'),

        maxPageButtonCount = props.get('maxPageButtonCount'),

        className = props.get('className'),

        metrics =
            PaginationHelper.calcPaginationMetrics(
                 pageIndex,
                 pageSize,
                 totalItemCount),

        paginationInfo =
            PaginationHelper.determineVisiblePaginationButtons(
                pageIndex,
                metrics.pageCount,
                maxPageButtonCount),

        classNameOuter =
            ComponentHelper.buildCssClass(
                'fk-pagination',
                className),
        
        classNameInner = 'pagination',
        
        firstPageLink =
            metrics.pageCount > 0
            ? renderLinkListItem(
                1,
                pageIndex === 0,
                bindMoveToPage(0))
            : null,
        
        precedingEllipsis =
            paginationInfo.firstButtonIndex > 1
            ? renderLinkListItem(
                '...',
                false,
                bindMoveToPage(Math.max(0,
                    paginationInfo.firstButtonIndex
                    - Math.floor(paginationInfo.pageButtonCount - 2) / 2)
                    - 1))
            : null,
        
        succeedingEllipsis =
            paginationInfo.lastButtonIndex < metrics.pageCount - 2
            ? renderLinkListItem(
                 '...',
                 false,
                 bindMoveToPage(Math.min(metrics.pageCount - 1,
                      paginationInfo.lastButtonIndex
                      + Math.floor(paginationInfo.pageButtonCount - 2) / 2)))
            : null,
        
        lastPageLink =
            metrics.pageCount > 0
            ? renderLinkListItem(
                metrics.pageCount,
                pageIndex === metrics.pageCount - 1,
                bindMoveToPage(metrics.pageCount - 1))
            : null,

        buttons =
            Seq.range(
                paginationInfo.firstButtonIndex ,
                paginationInfo.lastButtonIndex + 1)
            .map(index =>
                renderLinkListItem(
                   index + 1,
                   index === pageIndex,
                   bindMoveToPage(index)));
    
    return (
        dom('div',
            {className: classNameOuter},
            dom('ul',
                {className: classNameInner},
                firstPageLink,
                precedingEllipsis,
                ...buttons,
                succeedingEllipsis,
                lastPageLink))
    );
}

function renderLinkListItem(text, isActive, moveToPage) {
    return (
        dom('li', {
                className: isActive ? 'active' : '',
                key: text !== '...' ? text + '-' + isActive : undefined
            },
            dom('a',
                {onClick: moveToPage},
                text))
    );
}
