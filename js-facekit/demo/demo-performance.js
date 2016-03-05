'use strict';

/** @jsx dom */

import {Component}  from 'js-bling';
import {Seq} from 'js-prelude';
import {Observable, Subject} from 'rxjs';

import PaginationHelper from '../src/main/js/helpers/PaginationHelper.js';
import ComponentHelper from '../src/main/js/helpers/ComponentHelper.js';

import React from 'react';
import ReactDOM from 'react-dom';

const
    {createElement: dom, createEventBinder: binder} = Component,
    number = 100,
    pageSize = 25,
    totalItemCount = 1220;
    
export const Pagination = Component.createFactory({
    typeId: 'FKPagination',
   
    properties: {
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
        
        showNextButton: {
            type: 'boolean',
            defaultValue: true
        },
        
        onChange: {
            type: 'function',
            defaultValue: null
        }
    },

    view: behavior => {
        const 
            changeEvents = new Subject(),
            
            bindMoveToPage =
                binder(changeEvents, (_, pageIndex) => ({targetPage: pageIndex})),
            
            contents = behavior.map(props => {
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
                            bindMoveToPage(0))
                        : null,
        
                    precedingEllipsis =
                        paginationInfo.firstButtonIndex > 1
                        ? buildLinkListItem(
                            '...',
                            false)
                        : null,
    
                    succeedingEllipsis =
                        paginationInfo.lastButtonIndex < metrics.pageCount - 2
                        ? buildLinkListItem(
                            '...',
                            false)
                        : null,
                    
                    lastPageLink =
                        metrics.pageCount > 0
                        ? buildLinkListItem(
                            metrics.pageCount,
                            pageIndex === metrics.pageCount - 1,
                            bindMoveToPage(metrics.pageCount - 1))
                        : null,
    
                    buttons =
                        Seq.range(
                            paginationInfo.firstButtonIndex ,
                            paginationInfo.lastButtonIndex + 1)
                        .map(
                            index => buildLinkListItem(
                                index + 1,
                                index === pageIndex,
                                bindMoveToPage(index))
                        );   
                                                    
                return (
                    dom('div',
                        {className: classNameOuter},
                        dom('u',
                            {className: classNameInner},
                            firstPageLink,
                            precedingEllipsis,
                            buttons.toArray(),
                            succeedingEllipsis,
                            lastPageLink))
                );
            }),
        
            events = {
                change:
                    changeEvents
            };

        return {contents, events};
    }
});

            
function buildLinkListItem(text, isActive, moveToPage) {
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

export const DemoOfPagination = Component.createFactory({
    typeId: 'DemoOfPagination',
    
    model: actions => {
        return actions.startWith(0);
    },
    
    view: (_, model) => {
        const
            actions = new Subject(),
            bindOnChange = binder(actions, event => event.targetPage),
        
            contents = 
                model.map(pageIndex =>
                    dom('div',
                        {className: 'container-fluid'},
                        Seq.range(1, number).map(_ =>
                            dom('div',
                                {className: 'row'},
                                Pagination({
                                    className: "col-md-3",
                                    pageIndex: pageIndex,
                                    pageSize: pageSize,
                                    totalItemCount: totalItemCount,
                                    onChange: bindOnChange()})))));
        
        return {
            contents,
            actions
        }
    }
});

export const DemoOfPagination2 = Component.createFactory({
    typeId: 'DemoOfPagination',
    
    initialState: {
        pageIndex: 0
    },
    
    updateState: action => {
        return {pageIndex: action.targetPage};
    },
    
    render: (_, state) => {
        const
            actions = new Subject(),

            bindOnChange = binder(actions, event => ({
                targetPage: event.targetPage
            })),
        
            content = 
                dom('div',
                    {className: 'container-fluid'},
                    Seq.range(1, number).map(_ =>
                        dom('div',
                            {className: 'row'},
                            Pagination({
                                className: "col-md-3",
                                pageIndex: state.pageIndex,
                                pageSize: pageSize,
                                totalItemCount: totalItemCount,
                                onChange: bindOnChange()}))));
        return {
            content,
            actions
        };
    }
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
        this.state = {currPageIdx: 0};    
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
                                pageSize: pageSize,
                                totalItemCount: totalItemCount,
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
        DemoOfPagination2,
        'main-content',
        'React');
} else {
    ReactDOM.render(
        RDemoOfPagination(),
        document.getElementById('main-content'));
}
