import { defineComponent, mount, createElement as htm, Types } from 'js-surface/common';

import PaginationHelper from './PaginationHelper.js';
import ComponentHelper from './ComponentHelper.js';
import { Seq, Objects } from 'js-prelude';

import React from 'react';
import ReactDOM from 'react-dom';

const
    number = 100,
    pageSize = 25,
    totalItemCount = 1220;
    
export const Pagination = defineComponent({
    name: 'FKPagination',
   
    properties: {
        className: {
            type: Types.string,
            defaultValue: null
        },

        pageIndex: {
            type: Types.number,
            defaultValue: null
        },

        pageSize: {
            type: Types.number,
            defaultValue: null
        },

        totalItemCount: {
            type: Types.number,
            defaultValue: null
        },

        showFirstButton: {
            type: Types.bool,
            defaultValue: true
        },
        
        showLastButton: {
            type: Types.bool,
            defaultValue: true
        },
        
        showPreviousButton: {
            type: Types.bool,
            defaultValue: true
        },
        
        showNextButton: {
            type: Types.bool,
            defaultValue: true
        },
        
        onChange: {
            type: Types.func,
            defaultValue: null
        }
    },

    render({props}) {
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

            moveToPage = targetPage => {
                if (props.onChange) {
                    props.onChange({targetPage});
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
    }
});

            
function buildLinkListItem(text, isActive, moveToPage) {
    return (
        htm('li', {
                className: isActive ? 'active' : '',
                key: text !== '...' ? text + '-' + isActive : undefined
            },
            htm('a',
                {onClick: moveToPage},
                text))
    );
}

export const DemoOfPagination = defineComponent({
    name: 'DemoOfPagination',
    
    prepareState() {
        return { pageIndex: 0 };
    },
    
    commands: {
        moveToPage(pageIndex) {
            return state => {console.log('state', state); return Objects.transform(state, {
                pageIndex: {$set: pageIndex}
            })};
        }
    },

    render({ state, ctrl }) {
        return (
            htm('div',
                { className: 'container-fluid' },
                Seq.range(1, number + 1).map(_ =>
                   htm('div',
                        { className: 'row' },
                        Pagination({
                            className: "col-md-3",
                            pageIndex: state.pageIndex,
                            pageSize: pageSize,
                            totalItemCount: totalItemCount,
                            onChange: evt => ctrl.moveToPage(evt.targetPage)}))).toArray())
            );
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
                                            index)).toArray();        
                                            
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
                    ...Seq.range(1, number + 1).map(_ =>
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
    mount(
        DemoOfPagination(),
        'main-content');
} else {
    ReactDOM.render(
        RDemoOfPagination(),
        document.getElementById('main-content'));
}
