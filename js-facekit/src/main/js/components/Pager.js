'use strict';

import Button from '../components/Button.js';
import ButtonGroup from '../components/ButtonGroup.js';
import PaginationInfo from '../components/PaginationInfo.js';
import PaginationHelper from '../helpers/PaginationHelper.js';
import ComponentHelper from '../helpers/ComponentHelper.js';
import {Component, BindableSubject} from 'js-bling';

const dom = Component.createElement;

export default Component.createFactory({
    typeId: 'FKPager',
    
    defaultProps: {
        showFirstButton: true,
        showNextButton: true,
        showPreviousButton: true,
        showLastButton: true,
        onChange: evt => {}
    },

    view: behavior => {
        const onChange = new BindableSubject();

        return {
            display:
                 behavior.map(props => renderPager(props, onChange)),
                 
            events: {
                change: onChange.toObservable()
            }
        };
    }
});

function renderPager(props, onChange) {
    const
        metrics =
            PaginationHelper.calcPaginationMetrics(
                props.pageIndex,
                props.pageSize,
                props.totalItemCount),

        type = props.type,
        
        disabled = !!props.disabled,
        
        showFirstButton = !!props.showFirstButton,
        
        showNextButton = !!props.showNextButton,
        
        showPreviousButton = !!props.showPreviousButton,
        
        showLastButton =  !!props.showLastButton,
        
        showButtonTexts = !!props.showButtonTexts;
    
    return (
        dom('div',
            {className: 'fk-pager ' + props.className},
            ButtonGroup(
                null,
                showFirstButton && Button({
                    text: (showButtonTexts ? 'First' : ''),
                    icon: 'fa-angle-double-left',
                    className: 'fk-pager-Button-first',
                    tooltip: (showButtonTexts ? '' : 'First'),
                    disabled: disabled || metrics.isFirstPage,
                    onClick: onChange.bind(_ => {pageIndex: 0})
                }),
                
                showPreviousButton && Button({
                    text: (showButtonTexts ? 'Previous' : ''),
                    icon: 'fa-angle-left',
                    className: 'fk-pager-Button-previous',
                    tooltip: (showButtonTexts ? '' : 'Previous'),
                    disabled: disabled || metrics.isFirstPage,
                    onClick: onChange.bind(_ => {pageIndex: metrics.pageIndex - 1})
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
                    onClick: onChange.bind(_ => {pageIndex: metrics.pageIndex + 1})
                }),
                showLastButton && Button({
                    text: (showButtonTexts ? 'Last' : ''),
                    icon: 'fa-angle-double-right',
                    className: 'fk-pager-Button-last',
                    tooltip: (showButtonTexts ? '' : 'Last'),
                    disabled: disabled || metrics.isLastPage,
                    onClick: on(_ =>{pageIndex: metrics.pageCount - 1})
                })))
    );
}

                
            