'use strict';

import ComponentHelper from '../helpers/ComponentHelper.js';
import PaginationHelper from '../helpers/PaginationHelpers.js';
import {Component} from 'js-bling';
import {Seq} from 'js-prelude';

export default Component.createFactory({
    typeId: 'FKPagination',
    
    defaultProps: {
        showFirstButton: true,
        showNextButton: true,
        showPreviousButton: true,
        showLastButton: true,
        onChange: null
    },

    view: ({on, bind}, propsObs) => ({
        display: propsObs.map(props => {
            const
                
                pageIndex = props.get('pageIndex'),
                
                metrics = PaginationHelper.calcPaginationMetrics(
                                props.get('pageIndex'),
                                props.get('pageSize'),
                                props.get('totalItemCount')),
                
                paginationInfo = PaginationHelper.determineVisiblePaginationButtons(
                                        props.get('pageIndex'),
                                        metrics.pageCount,
                                        6),
                
                classNameOuter = ComponentHelper.buildCssClass(
                                        'fk-pagination',
                                        props.get('className')),
                
                classNameInner = 'pagination',
                
                firstPageLink = metrics.pageCount > 0
                                    ? buildLinkListItem(
                                            1, pageIndex === 0, props, 0)
                                    : null,
                
                precedingEllipsis = paginationInfo.firstButtonIndex > 1
                                        ? buildLinkListItem('...', false, props)
                                        : null,
                
                succeedingEllipsis = paginationInfo.lastButtonIndex < metrics.pageCount - 2
                                            ? buildLinkListItem('...', false, props)
                                            : null,
                
                lastPageLink =  metrics.pageCount > 0
                                    ? buildLinkListItem(
                                        metrics.pageCount,
                                        pageIndex === metrics.pageCount - 1,
                                        props, metrics.pageCount - 1)
                                    : null,

                buttons = Seq.range(
                                paginationInfo.firstButtonIndex ,
                                paginationInfo.lastButtonIndex + 1)
                            .map(index => buildLinkListItem(
                                index + 1,
                                index === pageIndex,
                                props,
                                index,
                                bind));        
            return (
                ['div',
                    {className: classNameOuter},
                    ['ul',
                        {className: classNameInner},
                        firstPageLink,
                        precedingEllipsis,
                        buttons,
                        succeedingEllipsis,
                        lastPageLink]]
            );
        }),
    
        events: {
            change: on('change')
                        .map(page => {targetPage: page})
        }
    })
});
    
            
            
function buildLinkListItem(text, isActive, props, pageIndexToMove, bind) {
    const
        onChangeProp = props.get('onChange'),
        
        onChange = typeof onChangeProp === 'function'
            ? bind('change', _ => pageIndexToMove)
            : null;
        
    return (
        ['li',
            {className: isActive ? 'active' : ''},
            ['a',
                {onClick: onChange},
                text]]
    );
}