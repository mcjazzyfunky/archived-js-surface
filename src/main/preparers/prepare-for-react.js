'use strict';

import ComponentMgr from '../core/ComponentMgr.js';
import ReactAdapter from '../adapters/ReactAdapter.js';

ComponentMgr.getGlobal()
      .registerAdapter(new ReactAdapter());
