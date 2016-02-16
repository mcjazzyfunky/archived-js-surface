'use strict';

import Button from '../components/Button.js';
import ButtonGroup from '../components/ButtonGroup.js';
import PaginationInfo from '../components/PaginationInfo.js';
import PaginationHelper from '../helpers/PaginationHelper.js';
import ComponentHelper from '../helpers/ComponentHelper.js';
import {Component} from 'js-bling';

export default Component.createFactory({
    typeId: 'FKPager',
    
    defaultProps: {
        showFirstButton: true,
        showNextButton: true,
        showPreviousButton: true,
        showLastButton: true,
        onChange: evt => {}
    },

    view: (_, propsObs) => ({
        display: propsObs.map(props => {
            const
                metrics = PaginationHelper.calcPaginationMetrics(
                                props.get('pageIndex'),
                                props.get('pageSize'),
                                props.get('totalItemCount')),
                
                type = props.get('type'),
                
                disabled = !!props.get('disabled'),
                
                showFirstButton = !!props.get('showFirstButton'),
                
                showNextButton = !!props.get('showNextButton'),
                
                showPreviousButton = !!props.get('showPreviousButton'),
                
                showLastButton =  !!props.get('showLastButton'),
                
                showButtonTexts = !!props.get('showButtonTexts');

        return (
            ['div',
                {className: 'fk-pager ' + props.get('className')},
                ButtonGroup(
                    null,
                    showFirstButton && Button({
                        text: (showButtonTexts ? 'First' : ''),
                        icon: 'fa-angle-double-left',
                        className: 'fk-pager-Button-first',
                        tooltip: (showButtonTexts ? '' : 'First'),
                        disabled: disabled || metrics.isFirstPage,
                        onClick: evt => props.get('onChange')({pageIndex: 0})
                    }),
                    
                    showPreviousButton && Button({
                        text: (showButtonTexts ? 'Previous' : ''),
                        icon: 'fa-angle-left',
                        className: 'fk-pager-Button-previous',
                        tooltip: (showButtonTexts ? '' : 'Previous'),
                        disabled: disabled || metrics.isFirstPage,
                        onClick: evt => props.get('onChange')({pageIndex: metrics.pageIndex - 1})
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
                        onClick: evt => props.get('onChange')({pageIndex: metrics.pageIndex + 1})
                    }),
                    showLastButton && Button({
                        text: (showButtonTexts ? 'Last' : ''),
                        icon: 'fa-angle-double-right',
                        className: 'fk-pager-Button-last',
                        tooltip: (showButtonTexts ? '' : 'Last'),
                        disabled: disabled || metrics.isLastPage,
                        onClick: evt => props.get('onChange')({pageIndex: metrics.pageCount - 1})
                    })
                )
            ]);
        }
    )
})});
                
                
            