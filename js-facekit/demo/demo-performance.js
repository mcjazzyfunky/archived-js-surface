'use strict';


import '../../src/main/preparers/prepare-for-react.js';
import Button from '../src/main/js/components/Button.js';
import ButtonGroup from '../src/main/js/components/ButtonGroup.js';
import Pager from '../src/main/js/components/Pager.js';
import Pagination from '../src/main/js/components/Pagination.js';
import PaginationInfo from '../src/main/js/components/PaginationInfo.js';
import {Component, ComponentMgr} from 'js-bling';
import {Seq} from 'js-prelude';

import PaginationHelper from '../src/main/js/helpers/PaginationHelper.js';
import ComponentHelper from '../src/main/js/helpers/ComponentHelper.js';

import React from 'react';
import ReactDOM from 'react-dom';

const
    buttonTypes = ['default', 'primary', 'success', 'info', 'warning', 'danger', 'link'],
    sizes = ['large', 'default', 'small', 'extra-small'],
    exampleIcons = ['fa-calendar', 'fa-twitter', 'glyphicon-home', 'glyphicon-print'],
    iconPositions = ['left', 'top', 'right', 'bottom'];


export const DemoOfPagination = Component.createFactory({
    typeId: 'DemoOfPagination',
    
    defaultProps: {
        pageIndex: 0,
        pageSize: 25,
        totalItemCount: 744
    },
    
    view: ({changes, events:{on, bind}}) =>
        on('goToPage')
            .merge(changes.map(props => props.get('pageIndex')))
            .combineLatest(changes, (currPageIdx, props) =>
                ['div',
                    {className: 'container-fluid'},
                    ...Seq.range(1, 100).map(_ =>
                        ['div',
                            {className: 'row'},
                            Pagination({
                                className: 'col-md-3',
                                pageIndex: currPageIdx,
                                pageSize: props.get('pageSize'),
                                totalItemCount: props.get('totalItemCount'),
                                onChange: bind('goToPage', ({targetPage}) => targetPage)
                            }),
                            Pager({
                                className: 'col-md-3',
                                pageIndex: currPageIdx,
                                pageSize: props.get('pageSize'),
                                totalItemCount: props.get('totalItemCount'),
                                onChange: evt => alert('juhu') 
                            })
                        ])])
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
                                ? buildLinkListItem(
                                        1,
                                        pageIndex === 0,
                                        this.props,
                                        0)
                                : null,
            
            precedingEllipsis = paginationInfo.firstButtonIndex > 1
                                    ? buildLinkListItem(
                                            '...',
                                            false,
                                            this.props)
                                    : null,
            
            succeedingEllipsis = paginationInfo.lastButtonIndex < metrics.pageCount - 2
                                        ? buildLinkListItem(
                                                '...',
                                                false,
                                                this.props)
                                        : null,
            
            lastPageLink =  metrics.pageCount > 0
                                ? buildLinkListItem(
                                    metrics.pageCount,
                                    pageIndex === metrics.pageCount - 1,
                                    this.props,
                                    metrics.pageCount - 1)
                                : null,

            buttons = Seq.range(
                            paginationInfo.firstButtonIndex ,
                            paginationInfo.lastButtonIndex + 1)
                        .map(index => buildLinkListItem(
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
                    ...buttons,
                    succeedingEllipsis,
                    lastPageLink))
        );
    }
}

function buildLinkListItem(text, isActive, props, pageIndexToMove = null) {
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
                    ...Seq.range(1, 100).map(_ =>
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


if (0) {
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