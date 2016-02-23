'use strict';

import ComponentHelper from '../helpers/ComponentHelper.js';
import PaginationHelper from '../helpers/PaginationHelper.js';
import {Component} from 'js-bling';
import {Seq} from 'js-prelude';

const dom = Component.createElement;

export default Component.createFactory({
    typeId: 'FKPagination',
    
    defaultProps: {
        showFirstButton: true,
        showNextButton: true,
        showPreviousButton: true,
        showLastButton: true,
        onChange: null
    },

    view: (behavior, {on, bind}) => ({
        display: behavior.map(props => {
            const
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
                                    ? buildLinkListItem(
                                            1,
                                            pageIndex === 0,
                                            props,
                                            bind,
                                            0)
                                    : null,
                
                precedingEllipsis = paginationInfo.firstButtonIndex > 1
                                        ? buildLinkListItem(
                                                '...',
                                                false,
                                                props,
                                                bind)
                                        : null,
                
                succeedingEllipsis = paginationInfo.lastButtonIndex < metrics.pageCount - 2
                                            ? buildLinkListItem(
                                                    '...',
                                                    false,
                                                    props,
                                                    bind)
                                            : null,
                
                lastPageLink =  metrics.pageCount > 0
                                    ? buildLinkListItem(
                                        metrics.pageCount,
                                        pageIndex === metrics.pageCount - 1,
                                        props,
                                        bind,
                                        metrics.pageCount - 1)
                                    : null,

                buttons = Seq.range(
                                paginationInfo.firstButtonIndex ,
                                paginationInfo.lastButtonIndex + 1)
                            .map(index => buildLinkListItem(
                                                index + 1,
                                                index === pageIndex,
                                                props,
                                                bind,
                                                index));        
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
        }),
    
        notifications: {
            change: on('change')
                        .map(page => ({targetPage: page}))
        }
    })
});
            
function buildLinkListItem(text, isActive, props, bind, pageIndexToMove = null) {
    const
        onChangeProp = props.onChange,
        
        onClick = !isActive && pageIndexToMove !== null && typeof onChangeProp === 'function'
            ? bind('change', _ => pageIndexToMove)
            : null;
        
    return (
        dom('li',
            {className: isActive ? 'active' : '', key: (pageIndexToMove === null ? undefined : pageIndexToMove + text + isActive)},
            dom('a',
                {onClick: onClick},
                text))
    );
}