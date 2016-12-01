import { defineComponent, mount, createElement as htm, Types, isElement } from 'js-surface';

import { Seq } from 'js-prelude';

import DemoApp from './components/DemoApp.js';

import Button from '../main/js/components/Button.js';
import Tabs from '../main/js/components/Tabs.js';
import Tab from '../main/js/components/Tab.js';
// import PaginationBar from '../main/js/components/PaginationBar.js';




mount(DemoApp(), 'main-content');


