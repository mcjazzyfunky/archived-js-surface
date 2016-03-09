'use strict';

import {Config, Objects, Seq} from 'js-prelude';
import ComponentHelper from '../helpers/ComponentHelper.js';
import PaginationHelper from '../helpers/PaginationHelper.js';
import {Component} from 'js-bling';

const dom = Component.createElement;

const data = {
    y: 'xxx',
    x: {
        x: {
            x: {
                x: {
                    x: 13
                }
            }
        }
    }
};

const config  = new Config(data);
let x;



Config.prototype.getXX = function (path, defaultValue = undefined) {
    let ret;

    if (typeof path === 'string') {
        ret = this.__data[path];
    } else if (!Array.isArray(path)) {
        throw new TypeError(
            `[Config:get] First parameter 'path' has to be a string or an array (invalid path: ${path})`);
    } else {
        const
            pathLength = path.length;

        if (pathLength === 0) {
            ret = this.__data;
        } else if (pathLength === 1) {
            ret = this.__data[path[0]];
        } else {
            let parent = this.__data;

            for (let i = 0; i < pathLength; ++i) {
                if (!parent) {
                    break;
                } else {
                    parent = parent[path[i]];

                    if (i === pathLength - 1) {
                        ret = parent;
                    }
                }
            }
        }
    }

    if (ret === undefined) {
        if (defaultValue !== undefined) {
            ret = defaultValue;
        } else {
            throw errorMissingValue(this, path);
        }
    }

    return ret;
}

Config.prototype.getx = function(path, defaultValue) {
    let ret;

    if (typeof path === 'string') {
        ret = this.__data[path];
    } else if (Array.isArray(path)) {
        const
            pathLength = path.length;

        if (pathLength === 0) {
            ret = this.__data;
        } else if (pathLength === 1) {
            ret = this.__data[path[0]];
        } else {
            let parent = this.__data;

            for (let i = 0; i < pathLength; ++i) {
                if (!parent) {
                    break;
                } else {
                    parent = parent[path[i]];

                    if (i === pathLength - 1) {
                        ret = parent;
                    }
                }
            }
        }
    }

    if (ret === undefined) {
        ret = defaultValue;
    }

    return ret;
}

Config.prototype.xgetString = function (path, defaultValue = undefined) {
    const ret = this.get(path, defaultValue);

    if (ret !== defaultValue && typeof ret !== 'string') {

    }

    return ret;
}

console.log("Start")
const start = new Date().getTime();

for (let i = 0; i < 1000000; ++i) {
    //x = config.get('y');
    // x = data.y;
    x = config.get(['x', 'x', 'x', 'x', 'x'])
    //x = Objects.getIn(data, ['y']);
    //x = config.get('y')
    //x = data['x']['x']['x']['x']['x'];
    //x = data.x.x.x.x.x;
}

const stop = new Date().getTime();
console.log("Stop")
console.log(x)
console.log(stop - start);

export default Component.createFactory({
    typeId: 'FKPaginationInfo',
    
    properties: {
        type: {
            type: 'string', 
            defaultValue: 'infoAboutPage',
            options: ['infoAboutPage']
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
    },

    view: behavior => behavior.map(renderPaginationInfo) 
});

function renderPaginationInfo(props) {
    const
        metrics = PaginationHelper.calcPaginationMetrics(
                        props.get('pageIndex'),
                        props.get('pageSize'),
                        props.get('totalItemCount'));

    return (
        dom('div',
            {className: 'fk-pagination-info'},
            props.type !== 'infoAboutItems'
                   ? getPageInfo(metrics)
                   : getItemsInfo(metrics))
    );
}

function getPageInfo(metrics) {
   return 'Page '
        + (metrics.pageIndex + 1)
        + (metrics.pageCount >= 0
            ? ' of '
            + metrics.pageCount : '');
}

function getItemsInfo(metrics) {
    const firstItemIndex = metrics.pageIndex !== -1 && metrics.pageCount !== -1
                ? metrics.pageIndex * metrics.pageSize
                : -1,
          
          lastItemIndex = firstItemIndex !== -1 && metrics.totalItemCount !== -1
                ? Math.min(
                    metrics.totalItemCount - 1, firstItemIndex + metrics.pageSize - 1)
                : -1;

    return (firstItemIndex + 1)
            +
            ' - '
            +(lastItemIndex + 1)
            + ' of '
            + metrics.totalItemCount;
}
