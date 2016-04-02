'use strict';

/** @jsx dom */

import {Component}  from 'js-surface';
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
        className: {
            type: 'string',
            defaultValue: null
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

    render({props}) {
        const
            pageIndex = props.get('pageIndex'),

            metrics =
                PaginationHelper.calcPaginationMetrics(
                    props.get('pageIndex'),
                    props.get('pageSize'),
                    props.get('totalItemCount')),

            paginationInfo =
                PaginationHelper.determineVisiblePaginationButtons(
                    props.get('pageIndex'),
                    metrics.pageCount,
                    6),

            classNameOuter =
                ComponentHelper.buildCssClass(
                    'fk-pagination',
                    props.get('className')),

            classNameInner = 'pagination',

            moveToPage = targetPage => {
                const onChange = props.get('onChange', null);

                if (onChange) {
                    onChange({targetPage: targetPage});
                }
            },

            firstPageLink =
                metrics.pageCount > 0
                ? buildLinkListItem(
                    1,
                    pageIndex === 0,
                    () => moveToPage(0))
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
                    () => moveToPage(metrics.pageCount - 1))
                : null,

            buttons =
                Seq.range(
                    paginationInfo.firstButtonIndex ,
                    paginationInfo.lastButtonIndex + 1)
                .map(
                    index => buildLinkListItem(
                        index + 1,
                        index === pageIndex,
                        () => moveToPage(index))
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

    initialState: {
        pageIndex: 0
    },

    updateState: ({state}) => ({
        moveToPage: pageIndex => {
            return {pageIndex: pageIndex};
        }
    }),

    render({state, update}) {
        return (
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
                            onChange: evt => update.moveToPage(evt.targetPage)})))));
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
        DemoOfPagination,
        'main-content',
        'React');
} else {
    ReactDOM.render(
        RDemoOfPagination(),
        document.getElementById('main-content'));
}
