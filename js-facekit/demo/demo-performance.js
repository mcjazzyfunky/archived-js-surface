'use strict';

/** @jsx dom */

import {Component}  from 'js-bling';
import {Seq} from 'js-prelude';

import PaginationHelper from '../src/main/js/helpers/PaginationHelper.js';
import ComponentHelper from '../src/main/js/helpers/ComponentHelper.js';

import React from 'react';
import ReactDOM from 'react-dom';

const
    htm = Component.createElement,
    number = 100;
    
export const Pagination = Component.createFactory({
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
                
                metrics =
                    PaginationHelper.calcPaginationMetrics(
                        props.pageIndex,
                        props.pageSize,
                        props.totalItemCount),
    
                paginationInfo =
                    PaginationHelper.determineVisiblePaginationButtons(
                        props.pageIndex,
                        metrics.pageCount,
                        6),
                
                classNameOuter =
                    ComponentHelper.buildCssClass(
                        'fk-pagination',
                        props.className),
    
                classNameInner = 'pagination',
                
                firstPageLink =
                    metrics.pageCount > 0
                    ? buildLinkListItem(
                        1,
                        pageIndex === 0,
                        props,
                        bind,
                        0)
                    : null,
    
                precedingEllipsis =
                    paginationInfo.firstButtonIndex > 1
                    ? buildLinkListItem(
                        '...',
                        false,
                        props,
                        bind)
                    : null,

                succeedingEllipsis =
                    paginationInfo.lastButtonIndex < metrics.pageCount - 2
                    ? buildLinkListItem(
                        '...',
                        false,
                        props,
                        bind)
                    : null,
                
                lastPageLink =
                    metrics.pageCount > 0
                    ? buildLinkListItem(
                        metrics.pageCount,
                        pageIndex === metrics.pageCount - 1,
                        props,
                        bind,
                        metrics.pageCount - 1)
                    : null,

                buttons =
                    Seq.range(
                        paginationInfo.firstButtonIndex ,
                        paginationInfo.lastButtonIndex + 1)
                    .map(index => buildLinkListItem(
                        index + 1,
                        index === pageIndex,
                        props,
                        bind,
                        index));   
                                                
            return (
                htm('div',
                    {className: classNameOuter},
                    htm('u',
                        {className: classNameInner},
                        firstPageLink,
                        precedingEllipsis,
                        buttons.toArray(),
                        succeedingEllipsis,
                        lastPageLink))
            );
        }),
    
        events: {
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
        htm('li',
            {className: isActive ? 'active' : '', key: (pageIndexToMove === null ? undefined : pageIndexToMove + text + isActive)},
            htm('a',
                {onClick: onClick},
                text))
    );
}

export const DemoOfPagination = Component.createFactory({
    typeId: 'DemoOfPagination',
    
    defaultProps: {
        pageIndex: 0,
        pageSize: 25,
        totalItemCount: 744
    },
    
    view: (behavior, {on, bind}) =>
        on('goToPage')
            .merge(behavior.map(props => props.pageIndex))
            .combineLatest(behavior, (currPageIdx, props) =>
                htm('div',
                    {className: 'container-fluid'},
                    Seq.range(1, number).map(_ =>
                        htm('div',
                            {className: 'row'},
                            Pagination({
                                className: "col-md-3",
                                pageIndex: currPageIdx,
                                pageSize: props.pageSize,
                                totalItemCount: props.totalItemCount,
                                onChange: bind('goToPage', ({targetPage}) => targetPage)})))))
});

// -----------------

class RPaginationClass extends React.Component {
    render() {
        const
            pageIndex = this.props.pageIndex,
            
            metrics = PaginationHelper.calcPaginationMetrics(
                            this.props.pageIndex,
                            this.props.pageSize,
                            this.props.totalItemCount),
            
            paginationInfo = PaginationHelper.determineVisiblePaginationButtons(
                                    this.props.pageIndex,
                                    metrics.pageCount,
                                    6),
            
            classNameOuter = ComponentHelper.buildCssClass(
                                    'fk-pagination',
                                    this.props.className),
            
            classNameInner = 'pagination',
            
            firstPageLink = metrics.pageCount > 0
                                ? buildLinkListItem2(
                                        1,
                                        pageIndex === 0,
                                        this.props,
                                        0)
                                : null,
            
            precedingEllipsis = paginationInfo.firstButtonIndex > 1
                                    ? buildLinkListItem2(
                                            '...',
                                            false,
                                            this.props)
                                    : null,
            
            succeedingEllipsis = paginationInfo.lastButtonIndex < metrics.pageCount - 2
                                        ? buildLinkListItem2(
                                                '...',
                                                false,
                                                this.props)
                                        : null,
            
            lastPageLink =  metrics.pageCount > 0
                                ? buildLinkListItem2(
                                    metrics.pageCount,
                                    pageIndex === metrics.pageCount - 1,
                                    this.props,
                                    metrics.pageCount - 1)
                                : null,

            buttons = Seq.range(
                            paginationInfo.firstButtonIndex ,
                            paginationInfo.lastButtonIndex + 1)
                        .map(index => buildLinkListItem2(
                                            index + 1,
                                            index === pageIndex,
                                            this.props,
                                            index));        
                                            
        return (
            React.createElement('div',
                {className: classNameOuter},
                React.createElement('ul',
                    {className: classNameInner},
                    firstPageLink,
                    precedingEllipsis,
                    buttons,
                    succeedingEllipsis,
                    lastPageLink))
        );
    }
}

function buildLinkListItem2(text, isActive, props, pageIndexToMove = null) {
    const
        onChangeProp = props.onChange,
        
        onClick = !isActive && pageIndexToMove !== null && typeof onChangeProp === 'function'
            ? () => onChangeProp({targetPage: pageIndexToMove}) 
            : null;
        
    return (
        React.createElement('li',
            {className: isActive ? 'active' : '', key: (pageIndexToMove === null ? undefined : pageIndexToMove + text + isActive)},
            React.createElement('a',
                {onClick: onClick},
                text))
    );
}


class RDemoOfPaginationClass extends React.Component {
    constructor() {
        super();
        this.state = {currPageIdx: 5};    
    }
    
    render() {
        return (
            React.createElement('div',
                    {className: 'container-fluid'},
                    ...Seq.range(1, number).map(_ =>
                        React.createElement('div',
                            {className: 'row'},
                            RPagination({
                                className: 'col-md-3',
                                pageIndex: this.state.currPageIdx,
                                pageSize: this.props.pageSize,
                                totalItemCount: this.props.totalItemCount,
                                onChange: evt => this.setState({currPageIdx: evt.targetPage})
                            })
                        )))
        );
    }
}

const
    RPagination = React.createFactory(RPaginationClass),
    RDemoOfPagination = React.createFactory(RDemoOfPaginationClass);


if (1) {
    Component.mount(
        DemoOfPagination({
            pageIndex: 10,
            pageSize: 25,
            totalItemCount: 1000       
        }),
        'main-content',
        'React');
} else {
    ReactDOM.render(
        RDemoOfPagination({
            pageIndex: 10,
            pageSize: 25,
            totalItemCount: 1000        
        }),
        document.getElementById('main-content'));
}

