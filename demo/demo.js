'use strict';


import '../src/main/preparers/prepare-for-react.js';
import Button from '../js-facekit/src/main/js/components/Button.js';
import {Component, ComponentMgr} from 'js-bling';

ComponentMgr.getGlobal().registerComponentFactory(Button);


Component.mount(['component:FKButton', null, 'Juhu'], 'main-content', 'React');