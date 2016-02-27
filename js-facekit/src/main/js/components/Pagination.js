'use strict';

import ComponentHelper from '../helpers/ComponentHelper.js';
import PaginationHelper from '../helpers/PaginationHelper.js';
import {Component, BindableSubject} from 'js-bling';
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

    view: behavior => {
        const
            onChange = new BindableSubject();

        return {
            display:
                behavior.map(props => renderPagination(props, onChange)),

            events: {
                change: onChange.toObservable()
            }
        };
    }
});
            
function renderPagination(props, onChange) {
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
                            ? renderLinkListItem(
                                    1,
                                    pageIndex === 0,
                                    props,
                                    onChange,
                                    0)
                            : null,
        
        precedingEllipsis = paginationInfo.firstButtonIndex > 1
                                ? renderLinkListItem(
                                        '...',
                                        false,
                                        props,
                                        onChange)
                                : null,
        
        succeedingEllipsis = paginationInfo.lastButtonIndex < metrics.pageCount - 2
                                    ? renderLinkListItem(
                                            '...',
                                            false,
                                            props,
                                            bindChange)
                                    : null,
        
        lastPageLink =  metrics.pageCount > 0
                            ? renderLinkListItem(
                                metrics.pageCount,
                                pageIndex === metrics.pageCount - 1,
                                props,
                                onChange,
                                metrics.pageCount - 1)
                            : null,

        buttons = Seq.range(
                        paginationInfo.firstButtonIndex ,
                        paginationInfo.lastButtonIndex + 1)
                    .map(index => renderLinkListItem(
                                        index + 1,
                                        index === pageIndex,
                                        props,
                                        onChange,
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
}

function renderLinkListItem(text, isActive, props, onChange, pageIndexToMove = null) {
    const
        onChangeProp = props.onChange,
        
        onClick = !isActive && pageIndexToMove !== null && typeof onChangeProp === 'function'
            ? onChange.bind(_ => pageIndexToMove)
            : null;
        
    return (
        dom('li',
            {className: isActive ? 'active' : '', key: (pageIndexToMove === null ? undefined : pageIndexToMove + text + isActive)},
            dom('a',
                {onClick: onClick},
                text))
    );
}
