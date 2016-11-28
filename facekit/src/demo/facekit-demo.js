import { defineComponent, mount, createElement as htm, Types, isElement } from 'js-surface/common';

import { Seq } from 'js-prelude';

import DataTable from '../main/js/components/DataTable.js';
import PaginationBar from '../main/js/components/PaginationBar.js';


const columns = [
    { title: 'Column 1',
      align: 'left'
    },
    { title: 'Column 2',
      align: 'right'
    },
    { title: 'Column 3',
      align: 'left'
    }
];

const FacekitDemo = defineComponent({
    name: 'FKDemo',
    
    render() {
        return (
            htm('div',
                'Juhu',
               // DataTable({ columns }),
                PaginationBar({pageIndex: 3, pageCount: 40, totalItemCount: 1234, pageSize: 25}))
        );
    }
    
});


mount(FacekitDemo(), 'main-content');


