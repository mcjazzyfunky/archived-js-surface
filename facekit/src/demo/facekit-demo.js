import { defineComponent, mount, createElement as htm, Types } from 'js-surface/common';

import PaginationBar from '../main/js/components/PaginationBar.js';

const FacekitDemo = defineComponent({
    name: 'FKDemo',
    
    render() {
        return (
            htm('div',
                null,
                PaginationBar({pageIndex: 3, pageCount: 40, totalItemCount: 1234, pageSize: 25}))
        );
    }
});


mount(FacekitDemo(), 'main-content');